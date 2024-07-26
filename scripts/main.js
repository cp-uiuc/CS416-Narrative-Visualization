const co2_url = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv";
const country_url = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv";

// Navigation logic for the slideshow
let currentScene = 0;
const scenes = document.querySelectorAll(".scene");
const tooltip = d3.select("#tooltip");

// set scene 1 as default active
scenes[0].classList.add("active");

const updateScene = () => {
    scenes.forEach((scene, index) => {
        scene.classList.toggle("active", index === currentScene);
    });

    const currentSceneDisplay = document.getElementById("current-scene-num");
    currentSceneDisplay.innerText = (currentScene + 1).toString();
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
    if (currentScene !== 0){
        loadSceneScript(currentScene);
    } else {
        document.querySelectorAll('script[data-scene]').forEach(script => script.remove());
    }

});

document.getElementById("prev").addEventListener("click", () => {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    updateScene();
    if (currentScene !== 0){
        loadSceneScript(currentScene);
    }
});

updateScene(currentScene);
loadSceneScript(currentScene);
