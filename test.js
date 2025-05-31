function hello(name){
    console.log(`hello,${name}`)
}

function sayhello(callback){
    const name="ali"
    callback(name)
}

sayhello(hello)