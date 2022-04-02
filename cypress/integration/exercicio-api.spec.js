/// <reference types="cypress" />
import contrato from '../contracts/usuarios.contract'
var faker = require('faker');

describe('Testes da Funcionalidade Usuários', () => {
     let token
     before(() => {
          cy.token('rodrigoknova@gmail.com', 'teste').then(tkn => { token = tkn })
     });

     it('Deve validar contrato de usuários', () => {
          cy.request('usuarios').then(response => {
               return contrato.validateAsync(response.body)
          })
     });

     it('Deve listar usuários cadastrados', () => {
          cy.request({
               method: 'GET',
               url: 'usuarios'
          }).then((response) => {
               expect(response.status).to.equal(200)
               expect(response.body).to.have.property('usuarios')
               expect(response.duration).to.be.lessThan(30)
          })
     });

     it('Deve cadastrar um usuário com sucesso', () => {
          cy.cadastrarUsuario(faker.internet.email(), faker.name.firstName(), faker.internet.password(), 'false')
               .then((response) => {
                    expect(response.status).to.equal(201)
                    expect(response.body.message).to.equal('Cadastro realizado com sucesso')
               })
     });

     it('Deve validar um usuário com email inválido', () => {
          cy.request({
               method: 'POST',
               url: 'usuarios',
               headers: { authorization: token },
               body: {
                    'nome': faker.name.firstName(),
                    'email': 'blablablabla',
                    'password': faker.internet.password(),
                    "administrador": 'false'
               },
               failOnStatusCode: false
          }).then((response => {
               expect(response.status).to.equal(400)
               expect(response.body.email).to.equal('email deve ser um email válido')
          }))
     });

     it('Deve editar um usuário previamente cadastrado', () => {
          let email = faker.internet.email()
          cy.cadastrarUsuario(email, 'blebleble', 'teste', 'false')
               .then(response => {
                    let id = response.body._id
                    cy.request({
                         method: 'PUT',
                         url: `usuarios/${id}`,
                         headers: { authorization: token },
                         body: {
                              "email": email,
                              "nome": 'blablabla',
                              "password": "teste",
                              "administrador": "false"
                         }
                    }).then((response => {
                         expect(response.body.message).to.equal('Registro alterado com sucesso')
                         expect(response.status).to.equal(200)
                    }))
               })
     });

     it('Deve deletar um usuário previamente cadastrado', () => {
          let email = faker.internet.email()
          cy.cadastrarUsuario(email, 'blebleble', 'teste', 'false')
               .then(response => {
                    let id = response.body._id
                    cy.request({
                         method: 'DELETE',
                         url: `usuarios/${id}`,
                         headers: { authorization: token },
                    }).then((response => {
                         expect(response.body.message).to.equal('Registro excluído com sucesso')
                         expect(response.status).to.equal(200)
                    }))
               })
     });
});
