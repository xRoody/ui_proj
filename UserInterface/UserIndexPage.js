const service_url = "http://localhost:8081";
const img_url = "http://localhost:8083";
let access_token = null;
let refresh_token = null;
const cat_menu = document.getElementById("cat_menu");
const offer_menu = document.getElementById("off_menu")
const storage = window.localStorage;
const  cart=document.getElementById("cart");
const logo=document.getElementById("logo");
cart.addEventListener('click', ()=>{
   init_cart();
});
logo.addEventListener('click', ()=>{
    let child = offer_menu.lastChild;
    while (child) {
        offer_menu.removeChild(child);
        child = offer_menu.lastChild;
    }
    init_categories_main_block();
})


async function idleClear(){
    let timer=setTimeout(await clear, 10*1000);;
    window.onload=reset_timer;
    window.onmousemove=reset_timer;
    window.onmousedown=reset_timer;
    window.ontouchstart=reset_timer;
    window.ontouchstart=reset_timer;
    window.onclick=reset_timer;
    window.onkeydown=reset_timer;
    window.addEventListener('scroll', reset_timer, true);
    async function clear(){
        storage.clear();
        let child = offer_menu.lastChild;
        while (child) {
            offer_menu.removeChild(child);
            child = offer_menu.lastChild;
        }
        await init_categories_main_block();

    }

    async function reset_timer(){
        clearTimeout(timer);
        timer=setTimeout(await clear, 5*60*1000); //5 minutes
    }
}


init_index().then();

async function init_index() {
    if (access_token == null) {
        await login().then(d => {
            access_token = d['access'];
            refresh_token = d['refresh'];
        });
    }
    init_categories().then();
    init_categories_main_block().then();
    idleClear();
    //load_img("offer", 1);
}

async function login() {
    let loginObj = {};
    loginObj.login = "UserService";
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

async function init_offers_from_cat(cat_id) {
    let response = await fetch(service_url + "/category/" + cat_id + "/allOffers", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        await init_offers_from_cat(cat_id);
        return;
    }
    let child = offer_menu.lastChild;
    while (child) {
        offer_menu.removeChild(child);
        child = offer_menu.lastChild;
    }
    for (let obj of rez) {
        let cat_wrapper = document.createElement("div");
        cat_wrapper.classList.add("offer_wrp");
        let pp = document.createElement("p");
        pp.textContent = obj.title;
        let int_cat_wrapper = document.createElement("div");
        int_cat_wrapper.classList.add("inn_cat_wrp");
        int_cat_wrapper.appendChild(pp);
        let img=await load_img("offers", obj.id);
        img.style.width="90%";
        img.style.height="80%";
        img.style.borderRadius="20px 20px 0 0"
        cat_wrapper.appendChild(img)
        cat_wrapper.appendChild(int_cat_wrapper)
        cat_wrapper.id = obj.id;
        cat_wrapper.addEventListener('click', () => {
            init_cur_offer(obj.id);
        })
        offer_menu.appendChild(cat_wrapper);
    }
}

async function init_categories() {
    let response = await fetch(service_url + "/category", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    })
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        await init_categories();
        return;
    }
    for (let obj of rez) {
        let cat_wrapper = document.createElement("div");
        cat_wrapper.classList.add("cat_wrp");
        let pp = document.createElement("p");
        pp.textContent = obj.title;
        cat_wrapper.appendChild(pp);
        cat_wrapper.id = obj.id;
        cat_wrapper.addEventListener('click', () => {
            init_offers_from_cat(obj.id);
        })
        cat_menu.appendChild(cat_wrapper);
    }

}

async function init_categories_main_block() {
    let response = await fetch(service_url + "/category", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    })
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        await init_categories_main_block();
        return;
    }
    for (let obj of rez) {
        let cat_wrapper = document.createElement("div");
        cat_wrapper.classList.add("offer_wrp");
        let pp = document.createElement("p");
        pp.textContent = obj.title;
        let int_cat_wrapper = document.createElement("div");
        int_cat_wrapper.classList.add("inn_cat_wrp");
        int_cat_wrapper.appendChild(pp);
        let img=await load_img("category", obj.id);
        img.style.width="90%";
        img.style.height="80%";
        img.style.borderRadius="20px 20px 0 0"
        cat_wrapper.appendChild(img);
        cat_wrapper.appendChild(int_cat_wrapper)
        cat_wrapper.id = obj.id;
        cat_wrapper.addEventListener('click', () => {
            init_offers_from_cat(obj.id);
        })
        offer_menu.appendChild(cat_wrapper);

    }
}

async function init_cur_offer(id) {
    let child = offer_menu.lastChild;
    while (child) {
        offer_menu.removeChild(child);
        child = offer_menu.lastChild;
    }
    let obj = await load_offer(id);
    let off_wrapper = document.createElement("div");
    off_wrapper.classList.add("cur_offer_wrapper");
    let title = document.createElement("p");
    title.textContent = obj.title;
    off_wrapper.appendChild(title);
    let pim_wrapper = document.createElement("div");
    pim_wrapper.classList.add("price_img_wrapper");
    let img=await load_img("offers", id);
    img.style.width="90%";
    img.style.height="90%";
    pim_wrapper.appendChild(img);
    off_wrapper.appendChild(pim_wrapper);
    let chars_wrapper = document.createElement("div");
    chars_wrapper.classList.add("char_wrapper");
    let price = document.createElement("p");
    price.textContent = "Price: " + obj.price;
    let quan = document.createElement("p");
    quan.textContent = "Quantity: 1";
    for (let cur of obj.characteristics) {
        price.textContent = "Price: " + ((Number(price.textContent.substring("Price: ".length)) + Number(cur.price) * Number(cur.quantity)));
        let cur_char_wrapper = document.createElement("div");
        cur_char_wrapper.classList.add("cur_char_wrapper");
        let title = document.createElement("p");
        title.textContent = cur.title;
        cur_char_wrapper.appendChild(title);
        let btc_wrapper = document.createElement("div");
        btc_wrapper.classList.add("button_count_wrapper");
        let plus = document.createElement("button");
        plus.textContent = "+";
        plus.classList.add("change_button");
        let count = document.createElement("p");
        count.textContent = cur.quantity;
        if (!cur.isDurable) {
            let minus = document.createElement("button");
            minus.textContent = "-";
            minus.classList.add("change_button");
            minus.addEventListener('click', () => {
                if (Number(count.textContent) !== 0) {
                    count.textContent = String(Number(count.textContent) - 1);
                    cur.quantity = Number(cur.quantity) - 1;
                    price.textContent = "Price: " + String(Number(price.textContent.substring("Price: ".length)) - Number(cur.price) * (Number(quan.textContent.substring("Quantity: ".length))));
                }
            })
            btc_wrapper.appendChild(minus);
            btc_wrapper.appendChild(count);
            plus.addEventListener('click', () => {
                count.textContent = String(Number(count.textContent) + 1);
                cur.quantity = Number(cur.quantity) + 1;
                price.textContent = "Price: " + String(Number(price.textContent.substring("Price: ".length)) + Number(cur.price) * (Number(quan.textContent.substring("Quantity: ".length))));
            })
            btc_wrapper.appendChild(plus);
        } else {
            count.style.margin = "0 50% 0 50%";
            btc_wrapper.appendChild(count);
        }
        cur_char_wrapper.appendChild(btc_wrapper);
        chars_wrapper.appendChild(cur_char_wrapper);
    }
    let buy_wrp = document.createElement("div");
    buy_wrp.classList.add("price_quan_wrapper");
    let minus_q = document.createElement("button");
    minus_q.textContent = "-";
    minus_q.classList.add("change_button");
    minus_q.addEventListener('click', () => {
        if ((Number(quan.textContent.substring("Quantity: ".length)) > 1)) {
            price.textContent = "Price: " + String(Number(price.textContent.substring("Price: ".length)) - Number(price.textContent.substring("Price: ".length)) / Number(quan.textContent.substring("Quantity: ".length)));
            quan.textContent = "Quantity: " + (Number(quan.textContent.substring("Quantity: ".length)) - 1);
        }
    })
    let plus_q = document.createElement("button");
    plus_q.textContent = "+";
    plus_q.classList.add("change_button");
    plus_q.addEventListener('click', () => {
        price.textContent = "Price: " + String(Number(price.textContent.substring("Price: ".length)) + Number(price.textContent.substring("Price: ".length)) / Number(quan.textContent.substring("Quantity: ".length)));
        quan.textContent = "Quantity: " + (Number(quan.textContent.substring("Quantity: ".length)) + 1);

    })
    buy_wrp.appendChild(price);
    let q_wrp = document.createElement("div");
    q_wrp.classList.add("quan_sub_wrapper");
    q_wrp.appendChild(minus_q);
    q_wrp.appendChild(quan);
    q_wrp.appendChild(plus_q);
    let buy_button = document.createElement("button");
    buy_button.classList.add("sub_button")
    buy_button.textContent = "Add to cart"
    buy_button.addEventListener('click', () => {
        obj.curPrice=Number(price.textContent.substring("Price: ".length))/Number(quan.textContent.substring("Quantity: ".length));
        if (storage.getItem(JSON.stringify(obj)) == null) storage.setItem(JSON.stringify(obj), quan.textContent.substring("Quantity: ".length));
        else {
            storage.setItem(JSON.stringify(obj), String(Number(storage.getItem(JSON.stringify(obj))) + Number(quan.textContent.substring("Quantity: ".length))));
        }
    })
    buy_wrp.appendChild(q_wrp);
    buy_wrp.appendChild(buy_button);
    off_wrapper.appendChild(chars_wrapper);
    off_wrapper.appendChild(buy_wrp);
    offer_menu.appendChild(off_wrapper);
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

async function init_cart(){
    let child = offer_menu.lastChild;
    while (child) {
        offer_menu.removeChild(child);
        child = offer_menu.lastChild;
    }
    let cart_wrapper=document.createElement("div");
    cart_wrapper.classList.add("cur_offer_wrapper");
    cart_wrapper.style.alignItems="center";
    let title=document.createElement("p");
    title.textContent="Cart";
    cart_wrapper.appendChild(title);
    for(let i=0; i<storage.length; i++){
        let cur=storage.key(i);
        let obj=JSON.parse(cur);
        let cur_node_wrapper=document.createElement("div");
        cur_node_wrapper.classList.add("cur_order_node_wrapper");
        let node_title=document.createElement("p");
        node_title.textContent=obj.title;
        let price=document.createElement("p");
        price.textContent="Price: "+(Number(obj['curPrice'])*Number(storage.getItem(cur)));//
        let quan=document.createElement("p");
        quan.textContent=storage.getItem(cur);
        let minus = document.createElement("button");
        minus.textContent = "-";
        minus.classList.add("change_button_node");
        let plus = document.createElement("button");
        plus.textContent = "+";
        plus.classList.add("change_button_node");
        minus.addEventListener('click', () => {
            if (Number(quan.textContent) !== 1) {
                quan.textContent = String(Number(quan.textContent) - 1);
                price.textContent = "Price: " + String(Number(price.textContent.substring("Price: ".length)) - Number(obj.curPrice));
            }
        })
        let btc_wrapper = document.createElement("div");
        btc_wrapper.classList.add("button_count_wrapper_node");
        btc_wrapper.appendChild(price);
        btc_wrapper.appendChild(minus);
        btc_wrapper.appendChild(quan);
        plus.addEventListener('click', () => {
            quan.textContent = String(Number(quan.textContent) + 1);
            price.textContent = "Price: " + String(Number(price.textContent.substring("Price: ".length)) + Number(obj.curPrice));
        })
        let del = document.createElement("button");
        del.textContent = "x";
        del.classList.add("change_button_node");
        del.addEventListener('click',()=>{
            storage.removeItem(cur);
            cur_node_wrapper.remove();
            if(cart_wrapper.getElementsByTagName("div").length==0) {
                cart_wrapper.removeChild(document.getElementById("sub_button"));
            }
        })
        btc_wrapper.appendChild(plus);
        btc_wrapper.appendChild(del);
        cur_node_wrapper.appendChild(node_title);
        cur_node_wrapper.appendChild(btc_wrapper);
        cart_wrapper.appendChild(cur_node_wrapper);
    }
    if(storage.key(0)){
        let sub = document.createElement("button");
        sub.textContent = "submit";
        sub.id="sub_button";
        sub.classList.add("sub_button");
        sub.addEventListener('click',async () => {
            let num=await send_nodes();
            console.log(num)
            storage.clear();
            let child = offer_menu.lastChild;
            while (child) {
                offer_menu.removeChild(child);
                child = offer_menu.lastChild;
            }
            await init_congratulation(num);
        })
        cart_wrapper.appendChild(sub);
    }
    offer_menu.appendChild(cart_wrapper);
}

async function send_nodes(){
    let wrapper={};
    let candidate={};
    let changes=[];
    wrapper.changes=changes;
    wrapper.order=candidate;
    candidate.status="Cooking";
    let today=new Date();
    candidate.dob=today.getFullYear()+"-"+((Number(today.getMonth())+1)<10?"0"+(Number(today.getMonth())+1):(Number(today.getMonth())+1))+"-"+(Number(today.getDate())<10?"0"+today.getDate():today.getDate())+" "+(Number(today.getHours())<10?"0"+Number(today.getHours()):Number(today.getHours()))+":"+(Number(today.getMinutes())<10?"0"+Number(today.getMinutes()):Number(today.getMinutes()));//"2022-03-14 18:30";//now
    candidate.offerOrderCards= [];
    for(let i=0; i<storage.length; i++) {
        let cur = storage.key(i);
        let obj = JSON.parse(cur);
        let node={};
        node.id=i;
        node.offerId=obj.id;
        node.quantity=storage.getItem(cur);
        candidate.offerOrderCards.push(node);
        let origin=await load_chars(obj.id);
        for(let ob of obj.characteristics){
            for(let or of origin){
                if(ob.id==or.id && ob.quantity!=or.quantity){
                    let change={};
                    change.id=ob.id;
                    change.cardId=i;
                    change.price=or.price;
                    change.quantity=Number(ob.quantity)-Number(or.quantity);
                    wrapper.changes.push(change);
                }
            }
        }
    }
    let rez= await send_order(wrapper);
    console.log(rez)
    return rez;
}

async function send_order(wrapper) {
    try {
        let response = await fetch(service_url + "/orders", {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wrapper)
        });
        let rez= await response.json();
        return rez;
    }catch (e){
        await refresh();
        return await send_order(wrapper);
    }
}

async function load_chars(id){
    let response = await fetch(service_url + "/offers/"+id+"/characteristics", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    });
    let rez = await response.json();
    if (rez.E) {
        await refresh();
        return await load_chars(id);
    }
    return rez;
}

async function init_congratulation(num){
    let con_wrapper=document.createElement("div");
    con_wrapper.classList.add("con_wrapper");
    let header=document.createElement("p");
    header.textContent="Your number: "+num;
    header.style.fontSize="60px";
    con_wrapper.appendChild(header);
    let button=document.createElement("button");
    button.classList.add("back_button");
    button.textContent="To main menu"
    button.addEventListener('click',()=>{
        let child = offer_menu.lastChild;
        while (child) {
            offer_menu.removeChild(child);
            child = offer_menu.lastChild;
        }
        init_categories_main_block();
    })
    con_wrapper.appendChild(button);
    offer_menu.appendChild(con_wrapper);
}

async function load_img(type, id){
    let img=document.createElement("img");
    img.src=img_url+ "/"+type+"/"+id;
    return img;
}