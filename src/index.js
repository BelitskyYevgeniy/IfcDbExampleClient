var ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath("../wasm/");

var url = 'https://localhost:44385/api/IfcFiles/';

var postBtn = document.getElementById("post-file-btn");
var filesSelect = document.getElementById('files-select');
var getBtn = document.getElementById("get-file-btn");

var loader = document.querySelector('.loader');

var hiddenLoaderClass = 'loader-hidden';

function showLoader()
{
    loader.classList.remove(hiddenLoaderClass);
}

function hideLoader()
{
    loader.classList.add(hiddenLoaderClass);
}

function loadFileNames()
{
    showLoader();

    fetch(url + 'files')
    .then((response)=> {
        console.log(response);
        
        hideLoader();
        
        return response.json();
    })
    .then((data)=>{
            console.log(data);
            filesSelect.innerHTML = "";
            data.forEach(element =>{
            const option = document.createElement('option');
            option.innerHTML = element;
            filesSelect.appendChild(option);
        });
    })
  .catch(error=>
  {
        hideLoader();
        console.error(error);
  });

}

function downloadFile(filename, content) {
    console.log('downloading file ...'); 
    const link = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    console.log(file);
    link.href = URL.createObjectURL(file);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    return file;
};

function SendFile(event)
{
    showLoader();

    const file = event.target.files[0];
    console.log(file);
    const ifcURL = URL.createObjectURL(file);
    try
    {
        ifcLoader.load(
            ifcURL,
            (ifcModel) => {
                scene.add(ifcModel);
                console.log(ifcModel)
            });
    }
    catch (e) 
    {
        alert('Invalid ifc file');
    }

          
  
    var fr=new FileReader();
    fr.onload=function(){
        fetch(url,
            {
                method: "POST",
                headers:{
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Content: fr.result, 
                    FileName: file.name
                })
            })
            .then((response)=>{
                hideLoader();
                console.log(response);
                if (response.status == 200)
                {
                    loadFileNames(url);
                }
                if (response.status == 303)
                {
                    alert('File was alreday loaded');
                }
                
            })
            .catch(error=>
            {
                hideLoader();
                console.log(error);
            });
      
    }
    fr.readAsText(file);
}

function GetFile()
{
    const filename = filesSelect.options[ filesSelect.selectedIndex ].value;
    console.log(filename);
    showLoader();
    fetch(url +'content?filename=' + filename,
    {
        method: "GET",
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods' : '*'
        }
    })
    .then((response)=>
    {
        hideLoader();
        if(response.status == 404)
        {
            alert('File not found');
            return Promise.reject();
        }
        return response.text();
    })
    .then((data)=>{
        downloadFile(filename, data);
    })
    .catch((error)=>{
        hideLoader();
        console.log(error);
    });
}	

loadFileNames();
postBtn.addEventListener("change", (event) => {SendFile(event);});
getBtn.addEventListener("click", (event) => {GetFile();});