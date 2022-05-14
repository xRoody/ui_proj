
const service_url = "http://localhost:8081";
const user_service_url = "http://localhost:8084";
let access_token = null;
let refresh_token = null;
const body=document.getElementsByTagName("body")[0];
const header=document.getElementsByTagName("header")[0];
let orders;
let info;
let log;
let pass;
let user_access;
let user_refresh;
let u_id;
let username;
let w_id;

init_page().then();

async function init_page(){
    if (access_token==null){
        await login().then(d => {
            access_token = d['access'];
            refresh_token = d['refresh'];
        });
    }
    await init_login_form();
}


async function login() {
    let loginObj = {};
    loginObj.login = "KitchenService";
    loginObj.password = "Sup3r+S3cret-p4ssw0rd";
    let response = await fetch(service_url + "/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginObj)
    });
    return await response.json();
}

async function refresh() {
    let response = await fetch(service_url + "/refresh", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + refresh_token,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    access_token = rez['access'];
}

async function use_refresh(){
    let response = await fetch(user_service_url + "/api/refresh", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + user_refresh,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    access_token = rez['access'];
}

async function init_orders(){
    let response = await fetch(service_url + "/orders", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        await init_orders();
        return;
    }
    let wrap=document.createElement("div");
    wrap.classList.add("wrapper");
    let inw=document.createElement("div");
    inw.classList.add("inner_wrapper");
    let status=document.createElement("div");
    status.classList.add("status_wrapper");
    let tit=document.createElement("p");
    tit.textContent="Orders";
    let ordd=document.createElement("div");
    ordd.classList.add("orders_wrapper");
    ordd.id="orders";
    let inf=document.createElement("div");
    inf.classList.add("info_wrapper");
    inf.id="info";
    orders=ordd;
    info=inf;
    status.appendChild(tit);
    inw.appendChild(status);
    inw.appendChild(ordd);
    wrap.appendChild(inw);
    wrap.appendChild(inf);
    body.appendChild(wrap);
    for(let cur of rez){
        if(!document.getElementById(cur.id)) {
            let cur_wrapper = document.createElement("div");//wrapper
            cur_wrapper.id = cur.id;
            cur_wrapper.classList.add("current_order");
            let num = document.createElement("p");
            num.textContent = cur.id;
            let price = document.createElement("p");
            price.textContent = "Price: " + await load_order_price(cur.id);
            let time = document.createElement("p");
            time.textContent = "Time: " + cur.dob.substring(11);
            cur_wrapper.appendChild(num);
            cur_wrapper.appendChild(time);
            cur_wrapper.appendChild(price);
            cur_wrapper.addEventListener("click", () => {
                console.log(cur.offerOrderCards);
                init_cards(cur.offerOrderCards);
            })
            orders.appendChild(cur_wrapper);
        }
    }
}
async function init_cards(cards){
    let child=info.lastChild;
    while (child){
        info.removeChild(child);
        child=info.lastChild;
    }
    for(let cur of cards){
        let title=document.createElement("p");//title
        let inf=await load_card_info(cur.id);
        let offer=await load_offer(cur.offerId);
        title.textContent=offer.title;
        let add_info=document.createElement("p");//info
        add_info.textContent="original";
        if(JSON.stringify(offer.characteristics).replaceAll("\"offerId\":"+cur.offerId+",", "")!=JSON.stringify(inf).replaceAll("\"cardId\":"+cur.id+",", "")){
            add_info.textContent="custom";
        }
        let quan=document.createElement("p");//quantity
        quan.textContent=cur.quantity;
        let wrp=document.createElement("div");
        wrp.classList.add("current_card");
        wrp.appendChild(title);
        wrp.appendChild(add_info);
        wrp.appendChild(quan)
        wrp.addEventListener('click',()=>{
            let child=info.lastChild;
            while (child){
                info.removeChild(child);
                child=info.lastChild;
            }
            for(let i of inf){
                let ci=document.createElement("div");
                ci.classList.add("current_card");
                let tit=document.createElement("p");
                tit.textContent=i.title;
                let qi=document.createElement("p");
                qi.textContent=i.quantity;
                ci.appendChild(tit);
                ci.appendChild(qi);
                info.appendChild(ci);
            }
            let back=document.createElement("button");
            back.textContent="Back";
            back.classList.add("finish_button");
            back.addEventListener('click',()=>{
                init_cards(cards);
            })
            info.appendChild(back);
        })
        info.appendChild(wrp);
    }
    let button=document.createElement("button");
    button.textContent="Finish";
    button.classList.add("finish_button");
    button.addEventListener('click',()=>{
        if(cards[0]){
            let ind=cards[0].orderId;
            orders.removeChild(document.getElementById(ind));
            let child=info.lastChild;
            while (child){
                info.removeChild(child);
                child=info.lastChild;
            }
            order_status_ready(ind);
        }
    })
    info.appendChild(button);

}

async function load_card_info(id){
    let response = await fetch(service_url + "/card/"+id+"/getInfo", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        return await init_orders();
    }
    return rez;
}

async function load_order_price(id){
    let response = await fetch(service_url + "/orders/"+id+"/getPrice", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        return await init_orders();
    }
    return rez;
}

async function load_offer(id) {
    let response = await fetch(service_url + "/offers/" + id, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    })
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        return await load_offer(id);
    }
    return rez;
}

async function order_status_ready(id){
    let response = await fetch(service_url + "/orders/"+id, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(1)
    });
    await send_order_node(id);
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        await order_status_ready(id);
    }
}

async function init_login_form(flag=false){
    let wrong=document.createElement("p");
    wrong.textContent="Wrong login and password pair";
    if(!flag) wrong.style.display="none";
    let log_t=document.createElement("p");
    log_t.textContent="Login";
    let login=document.createElement("input");
    let pass_t=document.createElement("p");
    pass_t.textContent="Password";
    let passin=document.createElement("input");
    let log_wrapper=document.createElement("div");
    log_wrapper.classList.add("wrapper");
    log_wrapper.style.alignItems="center";
    log_wrapper.style.justifyContent="center";
    let log_wrapper_inner=document.createElement("div");
    log_wrapper_inner.classList.add("log_inner");
    let button=document.createElement("button");
    button.addEventListener('click', async ()=>{
        let child=body.lastChild;
        while (child && child!=header){
            body.removeChild(child);
            child=body.lastChild;
        }
        await login_user(login.value, passin.value);

    });
    button.textContent="submit";
    log_wrapper_inner.appendChild(wrong);
    log_wrapper_inner.appendChild(log_t);
    log_wrapper_inner.appendChild(login);
    log_wrapper_inner.appendChild(pass_t);
    log_wrapper_inner.appendChild(passin);
    log_wrapper_inner.appendChild(button);
    log_wrapper.appendChild(log_wrapper_inner);
    body.appendChild(log_wrapper);
}

async function login_user(login, password){
    let logObj={};
    logObj.login=login;
    logObj.password=password;
    let response= await fetch(user_service_url+"/login", {
        method:'POST',
        body: JSON.stringify(logObj)
    });
    response.json().then(async (rez)=>{
        user_access=rez.access;
        user_refresh=rez['refresh'];
        u_id=Number(rez['id']);
        username=rez['username'];
        log=login;
        pass=password;
        let us=document.createElement("p");
        us.textContent="Employee: "+username;
        us.addEventListener('click',()=>{
            init_work_close(false);
        })
        us.style.cursor="pointer";
        header.appendChild(us);
        await init_orders();
        await open_work();
    }).catch(e=>{
        init_login_form(true);
    })
}

async function open_work(){
    let logObj={};
    let today=new Date();
    logObj.doo=today.getFullYear()+"-"+((Number(today.getMonth())+1)<10?"0"+(Number(today.getMonth())+1):(Number(today.getMonth())+1))+"-"+(Number(today.getDate())<10?"0"+today.getDate():today.getDate())+" "+(Number(today.getHours())<10?"0"+Number(today.getHours()):Number(today.getHours()))+":"+(Number(today.getMinutes())<10?"0"+Number(today.getMinutes()):Number(today.getMinutes()));//"2022-03-14 18:30";//now
    logObj.employeeId=u_id;
    let response= await fetch(user_service_url+"/api/add", {
        method:'POST',
        headers: {
            'Authorization': 'Bearer ' + user_access,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logObj)
    });
    w_id=await response.json();
}

async function send_order_node(id){
    let logObj={};
    let today=new Date();
    logObj.doe=today.getFullYear()+"-"+((Number(today.getMonth())+1)<10?"0"+(Number(today.getMonth())+1):(Number(today.getMonth())+1))+"-"+(Number(today.getDate())<10?"0"+today.getDate():today.getDate())+" "+(Number(today.getHours())<10?"0"+Number(today.getHours()):Number(today.getHours()))+":"+(Number(today.getMinutes())<10?"0"+Number(today.getMinutes()):Number(today.getMinutes()));//"2022-03-14 18:30";//now
    logObj.orderId=id;
    logObj.workId=w_id;
    let response= await fetch(user_service_url+"/api/orders", {
        method:'POST',
        headers: {
            'Authorization': 'Bearer ' + user_access,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logObj)
    });
    let rez=await response.json();
    if (rez.E) {
        await use_refresh();
        await send_order_node(id);
    }
}

function init_work_close(flag=false){
    let child=body.lastChild;
    while (child && child!=header){
        body.removeChild(child);
        child=body.lastChild;
    }
    let wrong=document.createElement("p");
    wrong.textContent="Wrong password";
    if(!flag) wrong.style.display="none";
    let pass_t=document.createElement("p");
    pass_t.textContent="Password";
    let passin=document.createElement("input");
    let log_wrapper=document.createElement("div");
    log_wrapper.classList.add("wrapper");
    log_wrapper.style.alignItems="center";
    log_wrapper.style.justifyContent="center";
    let log_wrapper_inner=document.createElement("div");
    log_wrapper_inner.classList.add("log_inner");
    let button=document.createElement("button");
    button.addEventListener('click', async ()=>{
        let child=body.lastChild;
        while (child && child!=header){
            body.removeChild(child);
            child=body.lastChild;
        }
        await close_work(passin.value);
    });
    let back=document.createElement("button");
    back.textContent="Back";
    back.style.marginTop="5vh";
    back.addEventListener('click',async ()=>{
        let child=body.lastChild;
        while (child && child!=header){
            body.removeChild(child);
            child=body.lastChild;
        }
        await init_orders();
    })
    button.textContent="Close work";
    log_wrapper_inner.appendChild(wrong);
    log_wrapper_inner.appendChild(pass_t);
    log_wrapper_inner.appendChild(passin);
    log_wrapper_inner.appendChild(button);
    log_wrapper_inner.appendChild(back);
    log_wrapper.appendChild(log_wrapper_inner);
    body.appendChild(log_wrapper);
}

async function close_work(p){
    let response=null;
    if(p==pass){
        response= await fetch(user_service_url+"/api/work/"+w_id, {
            method:'PATCH',
            headers: {
                'Authorization': 'Bearer ' + user_access,
                'Content-Type': 'application/json'
            }
        });
    }
    if(response==null){
        init_work_close(true);
    }
    else {
        document.location.reload();
        let rez=await response.json();
        if (rez.E) {
            await use_refresh();
            await close_work(p);
        }
    }
}

let client=null;

function connect(){
    const socket=new SockJS('/websocket');
    client=Stomp.over(socket);
    client.connect({}, (x)=>{
        console.log("!!!"+x);
        client.subscribe('/orders/new', (data)=>{
            console.log(data);
        })
    })
}

function disconnect(){
    if(client!=null){
        client.disconnect();
    }
}
