window.onload = function () {
    //object fr sidebar items
    let sidebar_items = {};
    let sidebar = document.querySelector('#main_sidebar');
    let tab_container = document.querySelector('#tab_container');

    //output sidebar items
    function output_sidebar_items() {
        for (let key in sidebar_items) {
            let li = document.createElement('li');
            li.className = 'main_sidebar__item';
            li.id = key;
            li.setAttribute('apiLink', sidebar_items[key]);
            li.innerText = key[0].toUpperCase() + key.slice(1);
            sidebar.appendChild(li);
        }
    }


    //function for first connect with api
    function getSidebar() {
        fetch('https://swapi.co/api/')
            .then(res => res.json())
            .then(json => sidebar_items = json)
            .then(res => output_sidebar_items())
    }

    getSidebar();


    let mainContainer = document.querySelectorAll('#tab_container')[0];

    //main storege
    let apiResult = [];

    //function for render items in main container
    function displayApiResult() {
        //substring for checking links in objext
        let substring = 'https://swapi';
        let render = apiResult.map((item, index) => {
            let render_item = document.createElement('div');
            render_item.className = 'render_item'
            for (key in item) {
                let render_child_key = document.createElement('div');
                let render_child_value = document.createElement('div');

                //search single link in key value
                if (typeof (item[key]) == 'string' && item[key].indexOf(substring) !== -1) {
                    render_child_key.className = 'render_item__child--link';
                    render_child_key.innerText = key[0].toUpperCase() + key.slice(1) + ' -  это кликабельная ссылка';
                    render_child_key.setAttribute('apiLink_detail', item[key]);
                    render_item.appendChild(render_child_key);

                }
                //search array of links in key value for recursive function
                else if (typeof (item[key]) == 'object' && item[key] != null && item[key].length > 0) {
                    render_child_key.className = 'render_item__child--recurse';
                    render_child_key.innerText = key[0].toUpperCase() + key.slice(1) + ' -  посмотреть все';
                    render_child_key.setAttribute('apiLink_detail__recurse', item[key]);
                    render_item.appendChild(render_child_key);
                }
                else {
                    render_child_key.className = 'render_item__child';
                    render_child_key.innerText = key[0].toUpperCase() + key.slice(1);
                    render_item.appendChild(render_child_key);

                    render_child_value.className = 'render_item__child';
                    render_child_value.innerText = item[key];
                    render_item.appendChild(render_child_value);
                }


            }
            tab_container.appendChild(render_item);
        })
    }

    //sidebar active class
    function removeActiveClass() {
        let main_sidebar__item = document.querySelectorAll('.main_sidebar__item');

        for (let i = 0; i < main_sidebar__item.length; i++) {
            main_sidebar__item[i].classList.remove('main_sidebar__item--active');
        }
    }


    //toggle active class and render content
    function toggleActiveClass(e, url, api_callback) {

        removeActiveClass();

        e.target.classList.add('main_sidebar__item--active');

        api_callback(url);
    }

    //main api function
    function api_callback(url) {
        mainContainer.innerHTML = '';
        fetch(url)
            .then(res => res.json())
            .then(json => apiResult = json.results)
            .then(res => displayApiResult());

    }

    // api function for detail element
    function singleElementDetail(url) {
        apiResult = [];
        fetch(url)
            .then(res => res.json())
            .then(json => apiResult.push(json))
            .then(res => mainContainer.innerHTML = '')
            .then(res => displayApiResult())
    }

    // api for recursive function
    function multipleElementDisplay(arr) {
        apiResult = [];
        arr.map(elem => {
            fetch(elem)
                .then(res => res.json())
                .then(json => apiResult.push(json))
                .then(res => mainContainer.innerHTML = '')
                .then(res => displayApiResult())

        })
    }



    document.body.onclick = function (e) {
        //click for sidebar element
        if (e.target.className == 'main_sidebar__item') {
            toggleActiveClass(e, e.target.attributes.apilink.nodeValue, api_callback);
        }
        //click for detail link
        else if (e.target.className == 'render_item__child--link') {
            removeActiveClass();
            let url = e.target.attributes.apiLink_detail.nodeValue;
            singleElementDetail(url);
        }
        //click for recursive link
        else if (e.target.className == 'render_item__child--recurse') {
            removeActiveClass();
            let urls = e.target.attributes.apiLink_detail__recurse.nodeValue;
            urls = urls.split(',');
            multipleElementDisplay(urls);

        }

    }


    //call api if focused in input
    document.querySelector('#search').onfocus = function (e) {
        removeActiveClass();
        if (e.target.value <= 0) {
            api_callback('https://swapi.co/api/people')
        }
    }

    //filter function
    function filterFunction(val, searchResult, callback) {
        apiResult = [];
        searchResult.map(item => {
            for (let key in item) {
                if (key == 'name' && item[key].toUpperCase().indexOf(val) > -1) {
                    mainContainer.innerHTML = '';
                    apiResult.push(item)
                    displayApiResult();
                }
            }

        });
    }

    //onchange input function 
    document.querySelector('#search').oninput = function (e) {
        const searchResult = apiResult;
        if (e.target.value.length > 0) {
            let val = e.target.value.toUpperCase();
            filterFunction(val, searchResult, displayApiResult);

        } else {
            api_callback('https://swapi.co/api/people')
        }

    }

}
