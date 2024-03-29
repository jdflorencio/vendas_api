const grupoService = require('./grupo.service')
const Response = require('../../core/response')
class GrupoController {
	constructor() {
		this.service = grupoService
	}

	async save(req, res) {
		try {
			const result = await this.service.save(req.body);
			new Response(res).success(result)

		} catch (error) {
			new Response(res).preConditionFailed(error)
		}
	}

	async update(req, res) {
		try {

			const result = await this.service.update(req.body);
			new Response(res).success(result)

		} catch (error) {
			new Response(res).preConditionFailed(error)
		}
	}

	async findOne(req, res) {
		try {

			const result = await this.service.findById(+req.params.id);
			new Response(res).success(result)

		} catch (error) {
			new Response(res).preConditionFailed(error)

		}
	}

	async findAll(req, res) {
		try {
			const result = await this.service.findAll();

			new Response(res).success(result)

		} catch (error) {
			new Response(res).preConditionFailed(error)
		}
	}

	async delete(req, res) {
		try {
			const { id } = req.params
			await this.service.deleting(id)
			new Response(res).success(id, `Grupo codigo: ${id} removido Com sucesso!`)

		} catch (error) {
			res.status(409).json({ sucesso: false, erro: error })
		}
	}
}

let grupo = new GrupoController();
module.exports = grupo;