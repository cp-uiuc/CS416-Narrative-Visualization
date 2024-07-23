const co2_url = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv";
const country_url = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv";

// Navigation logic for the slideshow
let currentScene = 0;
const scenes = document.querySelectorAll(".scene");
const slideBtns = document.querySelectorAll(".slide-btn");
const tooltip = d3.select("#tooltip");

// set scene 1 as default active
scenes[0].classList.add("active");
slideBtns[0].classList.add("active-btn")

const updateScene = () => {
    scenes.forEach((scene, index) => {
        scene.classList.toggle("active", index === currentScene);
    });

    slideBtns.forEach((btn, index) => {
        btn.classList.toggle("active-btn", index === currentScene);
    })
};

const loadSceneScript = (sceneIndex) => {
    const sceneScripts = ["scripts/scene1.js", "scripts/scene2.js", "scripts/scene3.js"];
    const scriptSrc = sceneScripts[sceneIndex];
    
    // Remove existing scene scripts to prevent duplicates
    document.querySelectorAll('script[data-scene]').forEach(script => script.remove());
    
    // Create and append the new scene script
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.setAttribute('data-scene', `scene${sceneIndex + 1}`);
    document.head.appendChild(script);
};

document.getElementById("next").addEventListener("click", () => {
    currentScene = (currentScene + 1) % scenes.length;
    updateScene();
    loadSceneScript(currentScene);
});

document.getElementById("prev").addEventListener("click", () => {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    updateScene();
    loadSceneScript(currentScene);

});

document.getElementById("btn-scene1").addEventListener("click", () => {
    currentScene = 0;
    updateScene();
    loadSceneScript(currentScene);
});

document.getElementById("btn-scene2").addEventListener("click", () => {
    currentScene = 1;
    updateScene();
    loadSceneScript(currentScene);
});

document.getElementById("btn-scene3").addEventListener("click", () => {
    currentScene = 2;
    updateScene();
    loadSceneScript(currentScene);
});

loadSceneScript(currentScene);
