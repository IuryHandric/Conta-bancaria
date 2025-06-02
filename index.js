const inquirer = require('inquirer');
const chalk = require('chalk')
const fs = require('fs');

operation()

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar conta', 
            'Consultar Saldo', 
            'Depositar', 
            'Sacar', 
            'Sair'
        ]
        }
        ])
    .then((answer) => {
        const action = answer['action'];

        if(action === 'Criar conta'){
            createAccount();
        } else if (action === 'Consultar Saldo'){
            getAccountBalance();
        } else if(action === 'Depositar'){
            deposit();
        } else if(action === 'Sacar'){
            withdraw();
        } else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por usar nosso banco!'))
            process.exit();
        };
    })
    .catch((e) => console.log(e));
}


// Criando a conta
function createAccount() {
    console.log(chalk.bgGreen.black('Obrigado por escolher o nosso banco!'))
    console.log(chalk.green('Defina o nome da sua conta a seguir:'))
    buildAccount();
}

// Formatando a conta, definindo nome
function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta'
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

// Criando um pseudobanco para armazenar as contas recebidas
        if(!fs.existsSync('accounts')) {
        // Criando a pasta, caso ainda não exista
            fs.mkdirSync('accounts')
        }
// Procurando se existe um arquivo com o nome da conta
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome'))
            buildAccount();
            return;
        }
// Se não existir o nome da conta, criando o arquivo.json.
    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => {console.log(err)})

    console.log(chalk.green('Parabéns, a sua conta foi criada!'));

    operation();

    })
    .catch((e) => console.log(e));
}

// Depositando na conta

function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Para qual conta deseja depositar?'
    }])
    .then((answer) => {
        const accountName = answer['accountName']
        // verificando se a conta existe
    
    if(!checkAccount(accountName)) {
        return deposit();
    }
    
    inquirer.prompt([{
        name: 'amount',
        message: 'Quanto você deseja depositar?'
    }])
    .then((answer) => {

    const amount = answer['amount']

    addAmount(accountName, amount);
    operation()
    })
    .catch((e) => console.log(e));

    })
    .catch((e) => console.log(e))
}

// Função para verificar se a conta existe

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Essa conta não existe, escolha outra conta!'))
        return false
    }
        return true
}


// Adicionando valores na conta via depósito

function addAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log('Ocorreu um erro, tente novamente mais tarde!')
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }    
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount},00 na conta de ${accountName}.`))

}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,
    {
    encoding: 'utf8',
    flag: 'r'
    })

    return JSON.parse(accountJSON);
}


// Mostrando o saldo da conta

function getAccountBalance() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        // verificando se a conta existe

    if(!checkAccount(accountName)) {
        return getAccountBalance();
    }    

    const accountData = getAccount(accountName)

    console.log(chalk.bgBlue.black(`O saldo da conta escolhida é de R$${accountData.balance},00 reais`))

    operation();
    
    })
    .catch((e) => console.log(e));
}

// Função para sacar dinheiro

function withdraw(){

    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withdraw();
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja sacar?'
        }])
        .then((answer) => {
            const amount = answer['amount']

            removeAmount(accountName, amount)
        })
        .catch((e) => console.log(e));


    })
    .catch((e)=> console.log(e));

}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return withdraw();
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black(`Valor indisponível, o seu saldo atual é de R$${accountData.balance},00.`));
        return withdraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (e) => {console.log(e)} 
    )

    console.log(chalk.green(`Saque de R$${amount},00, realizado com sucesso!\nSeu saldo atual é de R$${accountData.balance},00.`))


    operation();

}