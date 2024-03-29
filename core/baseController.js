const ResponsePlus = require('./response')

class BaseController {
    constructor(service) {
        this.service = service
    }

    getFilter(req) {
        const filter = {
            order: [['id']]
        }
        return filter
    }

    async getAll(req, res) {
        try {
            const records = await this.service.findAll(
                this.getFilter(req),
                req.credenciais,
            )
            new ResponsePlus(res).success(records)

        } catch (error) {
            new ResponsePlus(res).preConditionFailed(error.message)
        }
    }

    async getById(req, res) {

        try {
            req.params.id = parseInt(req.params.id)

            if (!req.params.id) {
                new ResponsePlus(res).preConditionFailed('Código do Registro inválido ')
                return
            }
            const record = await this.service.findbyId(
                req.params.id,
                req.credenciais
            )
            new ResponsePlus(res).success(record)

        } catch (error) {
            new ResponsePlus(res).preConditionFailed(error.message)
        }
    }

    async save(req, res) {
        try {
            const newRecord = await this.service.save(req.body, req.credenciais)
            new ResponsePlus(req).created(newRecord)

        } catch (error) {
            new ResponsePlus(res).preConditionFailed(error.message)
        }
    }

    async update(req, res) {
        try {

            req.body.id = req.body.id || req.params.id

            const updatedRecord = await this.service.update(req.body, req.credenciais)
            new ResponsePlus(res).success(updatedRecord)
        } catch (error) {
            new ResponsePlus(res).preConditionFailed(error.message)
        }
    }

    async remove(req, res) {
        try {
            const afectedRecords = await this.service.remove(
                req.query.ids, 
                req.credenciais
            )            
            new ResponsePlus(res).success(afectedRecords)
        } catch (error) {
            new ResponsePlus(res).preConditionFailed(error.message)
        }
    }

    async removeById(req, res) {
        try {
            const afectedRecords = await this.service.remove(
                req.query.id, 
                req.credenciais
            )
            new ResponsePlus(res).success(afectedRecords)
        } catch (error) {
            new ResponsePlus(res).preConditionFailed(error.message)
            
        }
    }
}

module.exports = BaseController