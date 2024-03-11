document.querySelector('.heading .search-icon svg').addEventListener('click', ()=>{
    document.querySelector(".heading").classList.add('search');
    document.querySelector('.heading input').focus()
})

const displayCountries = (list) => {
     document.querySelector(".countries-overflow").innerHTML = "";
    list.forEach(country => {
        const countryItem = document.createElement('div');
        const countryName = document.createElement('div')
         const phoneCode = document.createElement("div");

         countryItem.appendChild(countryName)
         countryItem.appendChild(phoneCode)
         
         countryItem.classList.add('country-item');
         countryName.classList.add('country-name');
         phoneCode.classList.add("phone-code");

         countryName.innerHTML = country.name;
         phoneCode.innerHTML = country.dial_code

         document.querySelector(".countries-overflow").appendChild(countryItem);
         countryItem.addEventListener('click', ()=>{
            document.querySelector(".phone input").value = country.dial_code;
             document.querySelector(".country-code").innerHTML = country.code;
             document.querySelector(".country-code").dataset.country = country.name;
            document.querySelector('.tel-bg').classList.remove('show')
             document.querySelector(".phone input").focus()
         })
    })
};

const submitForm = (body) => {
      const URL = window.location.href;
      const planCode = URL.split("/")[5];
    fetch(`/submit/payment/${planCode}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then((response) => {
        return response.json()
    }).then(data => {
      if(data.status){
            window.location.href = data.data.authorization_url;
      }else{
          document.querySelector(".form-box").classList.remove("load");
          document.querySelector(".submit-btn").classList.remove("load");
           document.querySelector(".form-box").classList.add("error");
           setTimeout(()=>{
                   document.querySelector(".form-box").classList.remove("error");
           }, 2000)
      }
    }).catch(err => {
          document.querySelector(".form-box").classList.remove("load");
          document.querySelector(".submit-btn").classList.remove("load");
           document.querySelector(".form-box").classList.add("error");
           setTimeout(() => {
             document.querySelector(".form-box").classList.remove("error");
           }, 2000);
    })
}



document.querySelector(".tel-drop").addEventListener('click', ()=>{
     document.querySelector(".tel-bg").classList.add("show");
});


document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    if(e.target.full_name.value != '' && 
    e.target.email.value != '' &&
    e.target.number.value.length > 8 &&
    e.target.telegram.value != ''){
        const data = {
          name: e.target.full_name.value,
          email: e.target.email.value,
          phone: e.target.number.value,
          telegram: e.target.telegram.value,
          country: document.querySelector(".country-code").dataset.country
        };
        document.querySelector(".form-box").classList.add("load");
        document.querySelector(".submit-btn").classList.add("load");
        submitForm(data)
    }else{
        if(e.target.number.value.length < 8){
            document.querySelector('.form-box .error-msg p').innerHTML = 'Invalid Phone No!!'
            document.querySelector(".form-box").classList.add("error");
            setTimeout(() => {
              document.querySelector(".form-box").classList.remove("error");
            }, 2000);
        }else{
             document.querySelector('.form-box .error-msg p').innerHTML = 'Required Field Missing!!'
            document.querySelector(".form-box").classList.add("error");
            setTimeout(() => {
              document.querySelector(".form-box").classList.remove("error");
            }, 2000);
        }
    }
  
})

const plans = [
  {
    code: "intermediate",
    plan: "Intermediate Mentorship",
    price: "$50/mo",
  },
  {
    code: "profitable",
    plan: "Profitable Trader",
    price: "$100/mo",
  },
  {
    code: "exclusive",
    plan: "Exclusive Mentorship",
    price: "$200/mo",
  },
];



document.addEventListener('DOMContentLoaded', () => {
    fetch('/CountryCodes.json').then((response)=> {
       return response.json()
    }).then((json) => {
       displayCountries(json)
        document.querySelector('.heading input').addEventListener('keyup', (e) => {
            const searchValue = e.target.value.toLowerCase();
            const searchResults = []
            json.forEach(country => {
                console.log(country)
                if(country.name.toLowerCase().includes(searchValue) || country.code.toLowerCase().includes(searchValue)){
                   searchResults.push(country)
                   displayCountries(searchResults)
                }else{
                    searchResults.filter(function(el){ 
                        return el != country
                     })
                     displayCountries(searchResults)
                }
            })
        })
        document.querySelector(".heading .back-icon").addEventListener('click', ()=>{
                if(document.querySelector(".heading").classList.contains('search')){
                    displayCountries(json)
                    document.querySelector(".heading").classList.remove('search')
                    document.querySelector(".heading input").value = '';
                }else{
                    displayCountries(json);
                     document.querySelector(".tel-bg").classList.remove("show");
                }
            });
         document.querySelector(".phone input").addEventListener('keydown', (e)=>{
                    const value = e.target.value
                    json.forEach(country => {
                        if(value.startsWith(country.dial_code)){
                            document.querySelector(".country-code").innerHTML = country.code;
                             document.querySelector(".country-code").dataset.country = country.name;
                        }
                    })
              })

        document.querySelector('form').addEventListener('submit', (e) => {
             json.forEach((country) => {
               if (document.querySelector(".phone input").value.startsWith(country.dial_code)) {
                    document.querySelector(".country-code").innerHTML = country.code;
                    document.querySelector(".country-code").dataset.country =
                        country.name;
                    }
             });
        })
    })
    const URL = window.location.href
    const planCode = URL.split("/")[5];
    const thisPlan = plans.filter(function(el){ 
        return el.code == planCode
    })[0]
    document.querySelector('.form-box h2').innerHTML = thisPlan.plan
    document.querySelector(".form-box .plan-text").innerHTML = `sign up for ${thisPlan.price}`;
})
