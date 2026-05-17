/* ----

# Pio Plugin
# By: Dreamer-Paul
# Last Update: 2019.8.18

---- */

var Paul_Pio = function (prop) {
    var current = {
        idol: 0,
        isDraggable: prop.mode === "draggable",
        menu: document.querySelector(".pio-container .pio-action"),
        canvas: document.getElementById("pio"),
        body: document.getElementsByClassName("pio-container")[0],
        root: document.location.protocol +'//' + document.location.hostname +'/'
    };

    var modules = {
        idol: function () {
            current.idol < (prop.model.length - 1) ? current.idol++ : current.idol = 0;
            return current.idol;
        },
        create: function (tag, prop) {
            var e = document.createElement(tag);
            if(prop.class) e.className = prop.class;
            return e;
        },
        rand: function (arr) {
            return arr[Math.floor(Math.random() * arr.length + 1) - 1];
        },
        render: function (text) {
            if(text.constructor === Array){
                dialog.innerText = modules.rand(text);
            }
            else if(text.constructor === String){
                dialog.innerText = text;
            }
            else{
                dialog.innerText = "Error!";
            }
            dialog.classList.add("active");
            clearTimeout(this.t);
            this.t = setTimeout(function () {
                dialog.classList.remove("active");
            }, 3000);
        },
        destroy: function () {
            current.body.parentNode.removeChild(current.body);
            document.cookie = "posterGirl=false;" + "path=/";
        }
    };

    var elements = {
        home: modules.create("span", {class: "pio-home"}),
        skin: modules.create("span", {class: "pio-skin"}),
        info: modules.create("span", {class: "pio-info"}),
        night: modules.create("span", {class: "pio-night"}),
        drag: modules.create("span", {class: "pio-drag"}),
        close: modules.create("span", {class: "pio-close"})
    };

    var dialog = modules.create("div", {class: "pio-dialog"});
    current.body.appendChild(dialog);

    var dragHandler = {
        enable: function () {
            var body = current.body;
            body.onmousedown = function () {
                var loc = {
                    x: event.clientX - this.offsetLeft,
                    y: event.clientY - this.offsetTop
                };
                function move(e) {
                    body.classList.add("active");
                    body.classList.remove("right");
                    body.style.left = (event.clientX - loc.x) + 'px';
                    body.style.top  = (event.clientY - loc.y) + 'px';
                }
                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", function () {
                    body.classList.remove("active");
                    document.removeEventListener("mousemove", move);
                });
            };
        },
        disable: function () {
            current.body.onmousedown = null;
        }
    };

    var action = {
        welcome: function () {
            if(document.referrer !== "" && document.referrer.indexOf(current.root) === -1){
                var ref = document.createElement('a');
                ref.href = document.referrer;
                var name = ref.hostname;
                if(prop.content.referer) {
                    modules.render(prop.content.referer.replace(/%t/, name));
                } else {
                    modules.render("Welcome from " + name + " !");
                }
            }
            else if(prop.tips){
                var text, hour = new Date().getHours();
                if (hour > 22 || hour <= 5) { text = 'Are you a night owl?'; }
                else if (hour > 5 && hour <= 8) { text = 'Good morning!'; }
                else if (hour > 8 && hour <= 11) { text = 'Good morning!'; }
                else if (hour > 11 && hour <= 14) { text = 'Lunch time!'; }
                else if (hour > 14 && hour <= 17) { text = 'Good afternoon!'; }
                else if (hour > 17 && hour <= 19) { text = 'Good evening!'; }
                else if (hour > 19 && hour <= 21) { text = 'Good evening!'; }
                else if (hour > 21 && hour <= 23) { text = 'Good night!'; }
                else { text = "Hello!"; }
                modules.render(text);
            }
            else{
                modules.render(prop.content.welcome || "Welcome!");
            }
        },
        touch: function () {
            current.canvas.onclick = function () {
                modules.render(prop.content.touch || ["Hey!", "Stop it!", "HENTAI!"]);
            };
        },
        buttons: function () {
            elements.home.onclick = function () { location.href = current.root; };
            elements.home.onmouseover = function () { modules.render(prop.content.home || "Home"); };
            current.menu.appendChild(elements.home);

            elements.skin.onclick = function () {
                loadlive2d("pio", prop.model[modules.idol()]);
                prop.content.skin && prop.content.skin[1] ? modules.render(prop.content.skin[1]) : modules.render("New look~");
            };
            elements.skin.onmouseover = function () {
                prop.content.skin && prop.content.skin[0] ? modules.render(prop.content.skin[0]) : modules.render("Change skin?");
            };
            if(prop.model.length > 1) current.menu.appendChild(elements.skin);

            elements.info.onclick = function () {
                window.open(prop.content.link || "https://paugram.com/coding/add-poster-girl-with-plugin.html");
            };
            elements.info.onmouseover = function () { modules.render("About"); };
            current.menu.appendChild(elements.info);

            elements.drag.onclick = function () {
                current.isDraggable = !current.isDraggable;
                if (current.isDraggable) {
                    dragHandler.enable();
                    elements.drag.classList.add("active");
                    modules.render("Drag mode on~");
                } else {
                    dragHandler.disable();
                    elements.drag.classList.remove("active");
                    current.body.classList.remove("active");
                    current.body.style.left = "";
                    current.body.style.top = "";
                    modules.render("Fixed mode on~");
                }
            };
            elements.drag.onmouseover = function () {
                modules.render(current.isDraggable ? "Click to fix" : "Click to drag");
            };
            if (current.isDraggable) elements.drag.classList.add("active");
            current.menu.appendChild(elements.drag);

            if(prop.night){
                elements.night.onclick = function () { eval(prop.night); };
                elements.night.onmouseover = function () { modules.render("Night mode"); };
                current.menu.appendChild(elements.night);
            }

            elements.close.onclick = function () { modules.destroy(); };
            elements.close.onmouseover = function () { modules.render(prop.content.close || "Bye~"); };
            current.menu.appendChild(elements.close);
        },
        custom: function () {
            if(!prop.content.custom) return;
            prop.content.custom.forEach(function (t) {
                if(!t.type) t.type = "default";
                var e = document.querySelectorAll(t.selector);
                if(e.length){
                    for(var j = 0; j < e.length; j++){
                        if(t.type === "read"){
                            e[j].onmouseover = function () {
                                modules.render("Read: " + this.innerText);
                            }
                        }
                        else if(t.type === "link"){
                            e[j].onmouseover = function () {
                                modules.render("Link: " + this.innerText);
                            }
                        }
                        else if(t.text){
                            e[j].onmouseover = function () { modules.render(t.text); }
                        }
                    }
                }
            });
        }
    };

    var begin = {
        static: function () { current.body.classList.add("static"); },
        fixed: function () { action.touch(); action.buttons(); },
        draggable: function () { action.touch(); action.buttons(); dragHandler.enable(); }
    };

    this.init = function () {
        if(prop.hidden === true && window.innerWidth < 400){
            current.body.classList.add("hidden");
        }
        else{
            action.welcome();
            switch (prop.mode){
                case "static": begin.static(); break;
                case "fixed":  begin.fixed(); break;
                case "draggable": begin.draggable(); break;
            }
            if(prop.content.custom) action.custom();
            loadlive2d("pio", prop.model[0]);
        }
    };
    this.init();
};

if (window.console && window.console.log) {
    console.log("%c Pio %c https://paugram.com ","color: #fff; margin: 1em 0; padding: 5px 0; background: #673ab7;","margin: 1em 0; padding: 5px 0; background: #efefef;");
}
