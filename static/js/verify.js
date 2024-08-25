const container = document.querySelector('.container')

const plans = [
  {
    planCode: "PLN_cu7k3ly30mwip4g",
    plan: "Intermediate Mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Intermediate Mentorship Programme</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+UjLezAMIxPZiMDRk`,
  },
  {
    planCode: "PLN_w9fggz2ezfe44u9",
    plan: "Profitable Trader",
    notes: [
      `This subscription will give you access to NivanFx <b>Profitable Trader Mentorship Programme</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+2rsnSiPVauBjYjk8`,
  },
  {
    planCode: "PLN_omp4zkk597lbobe",
    plan: "Exclusive Mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Exclusive Mentorship Programme</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+nDTp_I6cjTRiNDNk`,
  },
  {
    planCode: "PLN_d87553b9gq8mhde",
    plan: "Premium Signals",
    notes: [
      `This subscription will give you access to NivanFx <b>Premuim Signals Service</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+jqQphEmZeiZlOWFk`,
  },
];

const runValidation = () => {
      // const ref = window.location.href.split("&")[1].split("=")[1];
        container.classList.remove("error");
      container.classList.add("verify");
       container.classList.remove("valid");
      const ref = "7ttoydmt1q";
      console.log(ref);
      fetch(`/verify/${ref}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data)
          if (data.status) {
            const thisPlan = plans.filter(function (el) {
              return el.planCode == data.data.plan;
            })[0];
            displaySuccess(thisPlan);
          } else {
            displayError("Transaction does not exist.");
          }
        })
        .catch((err) => {
          console.log(err);
          displayError("Check your connection and try again.");
        });
    }

document.addEventListener('DOMContentLoaded', ()=>{
    runValidation()
})

const displayError = (msg) => {
    container.classList.add('error')
    container.classList.remove('verify')
    container.classList.remove('valid')
    container.querySelector('.error-msg').innerHTML = msg
}

const displaySuccess = (plan) => {
    container.classList.remove("error");
    container.classList.remove("verify");
    container.classList.add("valid");
    container.querySelector(".note ul").innerHTML = ``;
    plan.notes.forEach(note => {
         container.querySelector(".note ul").innerHTML += `<li>${note}</li>`
    });
    container.querySelector('.link-banner a').innerHTML = plan.telegram
    container.querySelector(".link-banner a").href = plan.telegram;
}

document.querySelector(".retry-btn").addEventListener('click', ()=>{
  runValidation()
});