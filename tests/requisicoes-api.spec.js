// @ts-check
import { test, expect } from '@playwright/test';
import exp from 'constants';

var token

test('Concultando as reservas cadastradas', async ({ request }) => {

    const response = await request.get('/booking')

    console.log(await response.json())

    expect(response.ok()).toBeTruthy()

    expect(response.status()).toBe(200)

})

test('Concultando as reservas cadastradas com base em um ID', async ({ request }) => {
    const response = await request.get('/booking/1152')

    const responseBody = await response.json();
    console.log(responseBody)


    expect(responseBody.firstname).toBe('Josh')
    expect(responseBody.lastname).toBe('Allen')
    expect(responseBody.totalprice).toBe(111)
    expect(responseBody.depositpaid).toBeTruthy()
    expect(responseBody.bookingdates.checkin).toBe('2018-01-01')
    expect(responseBody.bookingdates.checkout).toBe('2019-01-01')
    expect(responseBody.additionalneeds).toBe('super bowls')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

})

test('Consultando as reservas cadastradas com base em um ID validando apenas os campos', async ({ request }) => {

    const response = await request.get('booking/526')
    const jsonBody = await response.json()
    console.log(jsonBody)

    expect(jsonBody).toHaveProperty('firstname')
    expect(jsonBody).toHaveProperty('lastname')
    expect(jsonBody).toHaveProperty('totalprice')
    expect(jsonBody).toHaveProperty('depositpaid')
    expect(jsonBody).toHaveProperty('bookingdates')
    expect(jsonBody).toHaveProperty('additionalneeds')
    expect(jsonBody).not.toHaveProperty('bookingid')
    expect(jsonBody).not.toHaveProperty('checkin')
    expect(jsonBody).not.toHaveProperty('checkout')
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

})


test('Cadastrando uma reserva', async ({ request }) => {

    const response = await request.post('booking', {
        data: {
            "firstname": "Lucas",
            "lastname": "Silva",
            "totalprice": 9999,
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2018-01-01",
                "checkout": "2019-01-01"
            },
            "additionalneeds": "Breakfast"
        }
    })
    console.log(await response.json())
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)


    const responseBody = await response.json()
    expect(responseBody.booking).toHaveProperty("firstname", "Lucas")
    expect(responseBody.booking).toHaveProperty("lastname", "Silva")
    expect(responseBody.booking).toHaveProperty("totalprice", 9999)
    expect(responseBody.booking).toHaveProperty("depositpaid", true)
})


test('Gerando um token @regressivo', async ({ request }) => {

    const response = await request.post('/auth', {
        data: {
            "username": "admin",
            "password": "password123"
        }
    })
    console.log(await response.json())

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const responseBody = await response.json()
    token = responseBody.token
    console.log(`Seu token é: ${token}`)

})


test('Atualização parcial', async ({ request }) => {

    const response = await request.post('/auth', {
        data: {
            "username": "admin",
            "password": "password123"
        }
    })
    console.log(await response.json())

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const responseBody = await response.json()
    token = responseBody.token
    console.log(`Seu token é: ${token}`)

    const partialUpdateRequest = await request.patch('booking/2439', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': `token=${token}`

        },
        data: {
            "firstname": "David",
            "lastname": "Gomes",
            "totalprice": 100,
            "depositpaid": false
        }
    })
    console.log(await partialUpdateRequest.json())
    expect(partialUpdateRequest.ok()).toBeTruthy()
    expect(partialUpdateRequest.status()).toBe(200)

    const partialUpdateReponseBody = await partialUpdateRequest.json()

    expect(partialUpdateReponseBody).toHaveProperty("firstname", "David")
    expect(partialUpdateReponseBody).toHaveProperty("lastname", "Gomes")
    expect(partialUpdateReponseBody).toHaveProperty("totalprice", 100)
    expect(partialUpdateReponseBody).toHaveProperty("depositpaid", false)

})

test('Atualização Total', async ({ request }) => {

    const response = await request.post('/auth', {
        data: {
            "username": "admin",
            "password": "password123"
        }
    })
    console.log(await response.json())

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const responseBody = await response.json()
    token = responseBody.token
    console.log(`Seu token é: ${token}`)

    const totalUpdateRequest = await request.put('booking/306', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': `token=${token}`

        },
        data: {
            "firstname": "David",
            "lastname": "Gomes",
            "totalprice": 40000,
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2019-01-01",
                "checkout": "2020-01-01"
            },
            "additionalneeds": "Breakfast and Dinner"
        }
    })
    console.log(await totalUpdateRequest.json())
    expect(totalUpdateRequest.ok()).toBeTruthy()
    expect(totalUpdateRequest.status()).toBe(200)

    const partialUpdateReponseBody = await totalUpdateRequest.json()

    expect(partialUpdateReponseBody).toHaveProperty("firstname", "David")
    expect(partialUpdateReponseBody).toHaveProperty("lastname", "Gomes")
    expect(partialUpdateReponseBody).toHaveProperty("totalprice", 40000)
    expect(partialUpdateReponseBody).toHaveProperty("depositpaid", true)
    expect(partialUpdateReponseBody.bookingdates).toHaveProperty("checkin", "2019-01-01")
    expect(partialUpdateReponseBody.bookingdates).toHaveProperty("checkout", "2020-01-01")
    expect(partialUpdateReponseBody).toHaveProperty("additionalneeds", "Breakfast and Dinner")

})


test('Deletar reserva', async ({ request }) => {

    // Autenticação e obtenção do token
    const authResponse = await request.post('/auth', {
        data: {
            "username": "admin",
            "password": "password123"
        }
    });

    expect(authResponse.ok()).toBeTruthy();
    expect(authResponse.status()).toBe(200);

    const { token } = await authResponse.json();
    console.log(`Token obtido: ${token}`);

    // DELETE na reserva com ID 198
    const deleteResponse = await request.delete('/booking/198', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': `token=${token}` // Se a API aceitar Cookie para autenticação
            // 'Authorization': `Bearer ${token}`  // Caso a API use Bearer Token
        }
    });

    console.log(`Status Code: ${deleteResponse.status()}`);
    console.log(`Response Text: ${await deleteResponse.text()}`);

    // Verificações
    expect(deleteResponse.ok()).toBeTruthy();
    expect(deleteResponse.status()).toBe(201); // Algumas APIs retornam 200, 201 ou 204 ao excluir

});

test('Buscar reserva deletada', async ({ request }) => {
    const bookingId = 198; // ID que foi deletado anteriormente

    // Fazendo a requisição GET no ID deletado
    const response = await request.get(`/booking/${bookingId}`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    console.log(`Status Code: ${response.status()}`);
    console.log(`Response Text: ${await response.text()}`);

    // Validação: Esperamos que a API retorne 404
    expect(response.status()).toBe(404);
});

test('Validar erro 405 - Método não permitido', async ({ request }) => {
    const bookingId = 155555;


    const authResponse = await request.post('/auth', {
        data: {
            "username": "admin",
            "password": "password123"
        }
    });

    expect(authResponse.ok()).toBeTruthy();
    expect(authResponse.status()).toBe(200);

    const { token } = await authResponse.json();
    console.log(`Token obtido: ${token}`);


    // Tentando um método não permitido (exemplo: POST em um endpoint de GET)
    const response = await request.delete(`/booking/${bookingId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': `token=${token}`
        }
     
    });

    console.log(`Status Code: ${response.status()}`);
    console.log(`Response Text: ${await response.text()}`);

    // Validação: O esperado é que a API retorne 405
    expect(response.status()).toBe(405);

    // Opcional: Se a API retorna um corpo com a mensagem de erro, validar o texto
    const responseBody = await response.text();
    expect(responseBody).toContain("Method Not Allowed"); // Ajuste conforme a resposta da API
});





