const {Sequelize ,connection} = require('../../dao/connection')
const notaFiscalModel = require('../../dao/models/nota.model')
const itensFiscalModel = require('../../dao/models/nota_itens.model')
const pessoaModel = require('../../dao/models/pessoa.model')
const produtoModel =require('../../dao/models/produto.model')
const helper = require('./notaFiscal.helper')

const Promise = require('bluebird');

class NotaFiscalService {

	async findAll(pagina) {

		return await notaFiscalModel.findAndCountAll({
			include:[
				{
					model: pessoaModel,
					attributes: {
						exclude: ['sexo', 'data_nascimento', 'data_fundacao', 'nacionalidade', 'estado_civil', 'rg', 'createdAt', 'updatedAt' ]
					}
				}
			],
			attributes: ['id','numero', 'chave_nfe', 'data_emissao', 'tipo', 'total'],
			offset: ((pagina - 1)* 4),
			limit: 4,
		} )
	}

	async findById(notaFiscalId) {
		try{
			let cabecalho = await notaFiscalModel.findByPk(notaFiscalId, {
				include: [
					{
						model: pessoaModel,
						attributes: ['id','tipo', 'nome', 'nome_fantasia','cpf_cnpj' ]
					}
				],
				attributes: ['id','pessoaId' ,'numero', 'chave_nfe', 'data_emissao', 'tipo', 'total']
			})

			const itens = await produtoModel.findAll({
				attributes: ["descricao",  "estoque_atual", "referencia"],
				include: [
					{
						model: itensFiscalModel,
						where: [{
							notaId: cabecalho.id
						}]
					}
				]
			})
			
			return  {
				cabecalho, itens
			}
		} catch (error) {
			console.log(error)
		}
	}

	async save(payload) {
	
		const transaction = await connection.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED })

		try {
			let validPayload = helper.isValidCreate(payload)			
			if (validPayload.error) {
				return Promise.reject({
					message         : "Dados de entrada inválidos, verifique os campos obrigatorios",
					error           : validPayload.error.msg
				});
			}

			const modelBuild = notaFiscalModel.build(validPayload.value.cabecalho)
			const cabecalhoNota = await modelBuild.save({ transaction })


			let itens = []
			validPayload.value.itens.map( item => {
				item.nota_itens.notaId =  cabecalhoNota.id
				itens.push(item.nota_itens)
			})

			let inserts = [
				itensFiscalModel.bulkCreate(itens, {transaction})
			]

			return Promise.all(inserts)
			.then(() => {
				transaction.commit()
				return cabecalhoNota
			})


		} catch ( error ) {		

			transaction.rollback()
			throw error
		}
	}

	async update(payload) {
		
		let validPayload = helper.isValidUpdate(payload)
				
		if (validPayload.error) {
			return Promise.reject({
				message         : "Dados de entrada inválidos, verifique os campos obrigatorios",
				error           : validPayload.error.msg
			});
		}
		
		let notaFiscal = await notaFiscalModel.findByPk(validPayload.value.cabecalho.id)

		if(!notaFiscal) {
			return Promise.reject({
				message: "Nota Fiscal não encontrada.",
				error: ["Nota Fiscal não encontrada"]
			})
		}

		const itens = {
			novos: [],
			salvos: [],
			deletados:[]
		}

		validPayload.value.itens.map( item => {
			item.nota_itens.notaId = notaFiscal.id
			if (item.nota_itens["id"] != undefined && item.deletado != true) {
				itens.salvos.push(item.nota_itens)
			}
			
			if (item.nota_itens["id"] ==  undefined && item.deletado != true ) {
				itens.novos.push(item.nota_itens)
			}
			
			if (item.deletado ) {
				itens.deletados.push(item.nota_itens.id)
			} 
		})

		const transaction = await connection.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED })

		try {
			await notaFiscalModel.update(validPayload.value, {where: {id: notaFiscal.id}}, { transaction })

			const insert = [
				itensFiscalModel.bulkCreate(itens.salvos, { transaction: transaction, updateOnDuplicate: ["id"] }),
				itensFiscalModel.bulkCreate(itens.novos, { transaction }),
				itensFiscalModel.destroy({where: 
					{id: itens.deletados }
				}, { transaction })
			]

			return Promise.all(insert)
			.then((res)=> {
				console.log(res)
				transaction.commit()
				return notaFiscal
			})
		} catch ( error ) {
			transaction.rollback()
			throw error
		}
	}

	async deleting(notaFiscalId) {
		return await notaFiscalModel.destroy({ where: {id: notaFiscalId}})
	}
}

let notaFiscal = new NotaFiscalService();
module.exports = notaFiscal;