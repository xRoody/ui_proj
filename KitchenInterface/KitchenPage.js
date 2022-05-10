
const service_url = "http://localhost:8081";
let access_token = null;
let refresh_token = null;
const orders=document.getElementById("orders");
const info=document.getElementById("info");

init_page().then();

async function init_page(){
    if (access_token==null){
        await login().then(d => {
            access_token = d['access'];
            refresh_token = d['refresh'];
        });
    }
    await init_orders();
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
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        await order_status_ready(id);
    }
}