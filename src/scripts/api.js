export default class Api {
    #url

    constructor(url){
        this.#url = url
    }

    async get(){
        return this.#fetch({ method: 'GET' })
    }

    async create(data){
        return this.#fetch({ method: 'POST', body: JSON.stringify(data) })
    }

    async update(data){
        return this.#fetch({ method: 'PUT', body: JSON.stringify(data)  })
    }

    async delete(data){
        return this.#fetch({ method: 'DELETE', body: JSON.stringify(data)  })
    }

    #fetch(req){
        return fetch(this.#url, {
            ...req, 
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(
            data => data.json()
        ).catch(err => err)
    }
}