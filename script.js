document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn1').addEventListener('click', () => handleClick(document.getElementById('btn1')));
    document.getElementById('btn5').addEventListener('click', () => handleClick(document.getElementById('btn5')));
    document.getElementById('btn6').addEventListener('click', () => handleClick(document.getElementById('btn6')));
    document.getElementById('btn7').addEventListener('click', () => handleClick(document.getElementById('btn7')));
    document.getElementById('btn9').addEventListener('click', () => handleClick(document.getElementById('btn9')));
    document.getElementById('btn10').addEventListener('click', () => handleClick(document.getElementById('btn10')));
    document.getElementById('deleteBtn').addEventListener('click', () => window.electronAPI.closeProgram());
    document.getElementById('startBtn').addEventListener('click', () => window.electronAPI.runProgram());
});

const handleClick = (button) => {
    if(button.classList != 'BType1 clicked') {
        btn1.classList.remove('clicked')
        btn5.classList.remove('clicked')
        btn6.classList.remove('clicked')
        btn7.classList.remove('clicked')
        btn9.classList.remove('clicked')
        btn10.classList.remove('clicked')
        button.classList.add('clicked');
        numGp = "GP" + button.id.replace("btn", "")
        copyFile(numGp)
}}

const copyFile = (numGp) => {
    const source = `GP\\${numGp}\\parsec.ini`;
    console.log(source)
    window.electronAPI.copyFile(source);
}