

//Cube rotation
var isOnDiv = false;
$('#element').mouseenter(function(){isOnDiv=true;});
$('#element').mouseleave(function(){isOnDiv=false;});


$(function(){

    var el = document.createElement('div'),
        transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
        transformProp = support(transformProps),
        transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
        transitionDurationProp = support(transitionDuration);

    function support(props) {
        for(var i = 0, l = props.length; i < l; i++) {
            if(typeof el.style[props[i]] !== "undefined") {
                return props[i];
            }
        }
    }

    var mouse = {
            start : {}
        },
        touch = document.ontouchmove !== undefined,

        compass ={
            x: -14,
            y: 50,
            el: $('.compass')[0],
            move: function(coords) {
                if(coords) {
                    if(typeof coords.x === "number") this.x = coords.x;
                    if(typeof coords.y === "number") this.y = coords.y;
                }

                this.el.style[transformProp] = "rotateX("+(viewport.x+100)+"deg) rotateZ("+-viewport.y+"deg)";
            },
            reset: function() {
                this.move({x: 0, y: 0});
            }
        };

        viewport = {
            x: -14,
            y: 50,
            el: $('.bigbox')[0],
            move: function(coords) {
                if(coords) {
                    if(typeof coords.x === "number") this.x = coords.x;
                    if(typeof coords.y === "number") this.y = coords.y;
                }

                this.el.style[transformProp] = "rotateX("+this.x+"deg) rotateY("+this.y+"deg)";
            },
            reset: function() {
                this.move({x: -14, y: 50});
            }
        };

    viewport.duration = function() {
        var d = touch ? 800 : 800;
        viewport.el.style[transitionDurationProp] = 0 + "ms";
        return d;
    }();
    compass.duration = function() {
        var d = touch ? 800 : 800;
        compass.el.style[transitionDurationProp] = 0 + "ms";
        return d;
    }();

    $(document).keydown(function(evt) {
        switch(evt.keyCode)
        {
            case 37: // left
                viewport.move({y: viewport.y - 90});
                compass.move({y: compass.y - 90});
                break;

            case 38: // up
                evt.preventDefault();
                viewport.move({x: viewport.x + 90});
                compass.move({x: compass.x +90});
                break;

            case 39: // right
                viewport.move({y: viewport.y + 90});
                compass.move({y: compass.y + 90});
                break;

            case 40: // down
                evt.preventDefault();
                viewport.move({x: viewport.x - 90});
                compass.move({x: compass.x -90});
                break;

            case 27: //esc
                viewport.reset();
                compass.reset();
                break;

            default:
                break;
        };
    }).bind('mousedown touchstart', function(evt) {
        delete mouse.last;
        if($(evt.target).is('a, iframe')) {
            return true;
        }

        evt.originalEvent.touches ? evt = evt.originalEvent.touches[0] : null;
        mouse.start.x = evt.pageX;
        mouse.start.y = evt.pageY;
        $(document).bind('mousemove touchmove', function(event) {
            // Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
            try {
              var eventLength = event.originalEvent.touches.length;
            }
            catch(err) {
              eventLength = 0;
            }
            if(isOnDiv && !touch || !(event.originalEvent && eventLength > 1)) {
                event.preventDefault();
                // Get touch co-ords
                event.originalEvent.touches ? event = event.originalEvent.touches[0] : null;
                $('.scene').trigger('move-viewport', {x: event.pageX, y: event.pageY});
                $('.arrow').trigger('move-compass', {x: event.pageX, y: event.pageY});
            }else{
            }
        });

        $(document).bind('mouseup touchend', function () {
            $(document).unbind('mousemove touchmove');
        });
    });

    $('.scene').bind('move-viewport', function(evt, movedMouse) {

        // Reduce movement on touch screens
        var movementScaleFactor = touch ? 1 : 4;

        if (!mouse.last) {
            mouse.last = mouse.start;
        } else {
            if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
                mouse.start.x = mouse.last.x;
            }
            if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
                mouse.start.y = mouse.last.y;
            }
        }

        viewport.move({
            x: viewport.x + parseInt((mouse.start.y - movedMouse.y)/movementScaleFactor),
            y: viewport.y - parseInt((mouse.start.x - movedMouse.x)/movementScaleFactor)
        });

        mouse.last.x = movedMouse.x;
        mouse.last.y = movedMouse.y;

        function forward(v1, v2) {
            return v1 >= v2 ? true : false;
        }
    });
    $('.arrow').bind('move-compass', function(evt, movedMouse) {

        // Reduce movement on touch screens
        var movementScaleFactor = touch ? 1 : 4;

        if (!mouse.last) {
            mouse.last = mouse.start;
        } else {
            if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
                mouse.start.x = mouse.last.x;
            }
            if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
                mouse.start.y = mouse.last.y;
            }
        }

        compass.move({
            x: compass.x + parseInt((mouse.start.y - movedMouse.y)/movementScaleFactor),
            y: compass.y - parseInt((mouse.start.x - movedMouse.x)/movementScaleFactor)
        });

        mouse.last.x = movedMouse.x;
        mouse.last.y = movedMouse.y;

        function forward(v1, v2) {
            return v1 >= v2 ? true : false;
        }
    });



});