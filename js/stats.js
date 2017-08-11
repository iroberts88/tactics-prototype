/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

    var startTime = Date.now(), prevTime = startTime;
    var ms = 0, msMin = Infinity, msMax = 0;
    var fps = 0, fpsMin = Infinity, fpsMax = 0;
    var ping = 0, pingTimeStart = 0, pingTotal = 0, pingTotalNum = 0, pingAvg = 0, pingMin = Infinity, pingMax = 0;
    var frames = 0, mode = 0;

    var container = document.createElement( 'div' );
    container.id = 'stats';
    //container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); modeSwitch( ++ mode % 4 ) }, false );
    container.style.cssText = 'width:120px;opacity:0.9;';

    var fpsDiv = document.createElement( 'div' );
    fpsDiv.id = 'fps';
    fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
    container.appendChild( fpsDiv );

    var fpsText = document.createElement( 'div' );
    fpsText.id = 'fpsText';
    fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    fpsText.innerHTML = 'FPS';
    fpsDiv.appendChild( fpsText );

    var fpsGraph = document.createElement( 'div' );
    fpsGraph.id = 'fpsGraph';
    fpsGraph.style.cssText = 'position:relative;width:114px;height:30px;background-color:#0ff';
    fpsDiv.appendChild( fpsGraph );

    while ( fpsGraph.children.length < 114 ) {

        var bar = document.createElement( 'span' );
        bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
        fpsGraph.appendChild( bar );

    };

    var msDiv = document.createElement( 'div' );
    msDiv.id = 'ms';
    msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
    container.appendChild( msDiv );

    var msText = document.createElement( 'div' );
    msText.id = 'msText';
    msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    msText.innerHTML = 'MS';
    msDiv.appendChild( msText );

    var msGraph = document.createElement( 'div' );
    msGraph.id = 'msGraph';
    msGraph.style.cssText = 'position:relative;width:114px;height:30px;background-color:#0f0';
    msDiv.appendChild( msGraph );

    while ( msGraph.children.length < 114 ) {

        var bar = document.createElement( 'span' );
        bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
        msGraph.appendChild( bar );

    };

    var pingDiv = document.createElement( 'div' );
    pingDiv.id = 'ping';
    pingDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#200;display:none';
    container.appendChild( pingDiv );

    var pingText = document.createElement( 'div' );
    pingText.id = 'pingText';
    pingText.style.cssText = 'color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    pingText.innerHTML = 'PING';
    pingDiv.appendChild( pingText );

    var pingGraph = document.createElement( 'div' );
    pingGraph.id = 'pingGraph';
    pingGraph.style.cssText = 'position:relative;width:114px;height:30px;background-color:#f00';
    pingDiv.appendChild( pingGraph );

    while ( pingGraph.children.length < 114 ) {

        var bar = document.createElement( 'span' );
        bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#311';
        pingGraph.appendChild( bar );

    };


    var modeSwitch = function ( value ) {

        mode = value;

        switch ( mode ) {

            case 0:
                fpsDiv.style.display = 'block';
                msDiv.style.display = 'none';
                pingDiv.style.display = 'none';
                break;
            case 1:
                fpsDiv.style.display = 'none';
                msDiv.style.display = 'none';
                pingDiv.style.display = 'block';
                break;
            case 2:
                fpsDiv.style.display = 'none';
                msDiv.style.display = 'block';
                pingDiv.style.display = 'none';
                break;
            case 3:
                fpsDiv.style.display = 'block';
                msDiv.style.display = 'block';
                pingDiv.style.display = 'block';
                break;
        }

    };

    var updateGraph = function ( dom, value ) {

        var child = dom.appendChild( dom.firstChild );
        child.style.height = value + 'px';

    };

    return {

        REVISION: 12,

        domElement: container,

        modeSwitch: modeSwitch,

        begin: function () {

            startTime = Date.now();

        },

        end: function () {

            var time = Date.now();

            ms = time - startTime;
            msMin = Math.min( msMin, ms );
            msMax = Math.max( msMax, ms );

            msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
            updateGraph( msGraph, Math.min( 30, 30 - ( ms / 200 ) * 30 ) );

            frames ++;

            if ( time > prevTime + 1000 ) {
                //update FPS
                fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
                fpsMin = Math.min( fpsMin, fps );
                fpsMax = Math.max( fpsMax, fps );

                fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
                updateGraph( fpsGraph, Math.min( 30, 30 - ( fps / 100 ) * 30 ) );

                prevTime = time;
                frames = 0;

                //update PING
                //Acorn.Net.socket_.emit('clientCommand',{command: 'ping'});
                pingTimeStart = Date.now();
                pingMin = Math.min( pingMin, ping );
                pingMax = Math.max( pingMax, ping );

                pingText.textContent = ping + ' PING (' + pingMin + '-' + pingMax + ')(' + pingAvg + ')';
                updateGraph( pingGraph, Math.min( 30, 30 - ( ping / 200 ) * 30 ) );
            };

            return time;

        },

        pingReturn: function(){
            ping = Math.round(Date.now()-pingTimeStart);
            pingTotal += ping;
            pingTotalNum += 1;
            pingAvg = Math.round(pingTotal/pingTotalNum);
        },
        getMode: function(){
            return mode;
        },
        setMode: function(m){
            mode = m;
        },
        update: function () {

            startTime = this.end();

        }

    }

};

if ( typeof module === 'object' ) {

    module.exports = Stats;

}