var Credentials = function () {


    var container = document.createElement( 'div' );
    container.id = 'credentials';
    container.type = 'form';
    container.class = "modal-content";
    container.style.cssText = 'margin: -120px 0 0 -170px;width:100%;top:50%;left:50%;opacity:0.9;overflow:auto;background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4);position:absolute;';

    var usrInputText = document.createElement( 'div' );
    usrInputText.id = 'usrInputText';
    usrInputText.style.cssText = 'padding:10px 10px 10px 10px;color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:32px;font-weight:bold;line-height:15px';
    usrInputText.innerHTML = 'User Name: ';
    container.appendChild( usrInputText );

    var usrInput = document.createElement( 'input' );
    usrInput.id = 'usrInput';
    usrInput.type = 'text';
    usrInput.name = 'userName';
    usrInput.style.display = 'block';
    usrInput.style.cssText = 'position:relative;width:300px;height:50px;background-color:#fff;font-size: 32px';
    container.appendChild( usrInput );

    var pwInputText = document.createElement( 'div' );
    pwInputText.id = 'pwInputText';
    pwInputText.style.cssText = 'padding:10px 10px 10px 10px;color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:32px;font-weight:bold;line-height:15px';
    pwInputText.innerHTML = 'Password: ';
    container.appendChild( pwInputText );

    var pwInput = document.createElement( 'input' );
    pwInput.id = 'pwInput';
    pwInput.type = 'password';
    pwInput.name = 'password';
    pwInput.style.cssText = 'width:300px;height:50px;background-color:#fff;font-size: 32px';
    pwInput.style.display = 'block';
    container.appendChild( pwInput );

    var cType = 'login';

    return {

        domElement: container,

        setType: function(type){
            if (type == 'login'){
                cType = type;
                usrInputText.textContent = 'User Name: ';
                pwInputText.textContent = 'Password: ';
            }else if (type == 'new'){
                cType = type;
                usrInputText.textContent = 'Enter a Username (3-16 chars): ';
                pwInputText.textContent = 'Enter a Password (8-16 chars): ';
            }
        },
        getUsrText: function(){
            return usrInputText;
        },
        getPwText: function(){
            return pwInputText;
        },
        getType: function(){
            return cType;
        }
    }



};

if ( typeof module === 'object' ) {

    module.exports = Credentials;

}