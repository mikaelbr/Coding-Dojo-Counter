
/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */

(function($) {

    var o = $({});

    $.subscribe = function() {
        o.on.apply(o, arguments);
    };

    $.unsubscribe = function() {
        o.off.apply(o, arguments);
    };

    $.publish = function() {
        o.trigger.apply(o, arguments);
    };

}(jQuery));


// Coding Dojo App code

var App = (function ($, canvasPieTimer) {
    var App = function ($userList, $clockBox, $sparringBox) {

        this._$userList = $userList;
        this._$clockBox = $clockBox;
        this._$sparringBox = $sparringBox;
        this.init();

        return this;
    };

    App.prototype = {
        accessToken: "AAACEdEose0cBABotiZAm4CkZBZCUzDJeL53m1CWGuawvTY9tV41k1pSJwEycMhiPyN5XfgMjDhSLzmLTPuHXt52rszX8ZCxLiLEoZChcIhgZDZD",
        timerIsGoing: false,
        hasUserSwapped: true,
        init: function () {
            this._ajaxSettings();
            this._bindEvents();
            this._fetchUsers();
            this._initClock();
        },

        _initClock: function () {
            var time = parseInt($("#amount-time").val(), 10);
            canvasPieTimer.timeLimit = time * 60 * 1000;
            canvasPieTimer.init(350, "clock-canvas", "clock-box");
            canvasPieTimer.pause();


            canvasPieTimer.doSomething = function () {
                var warning = '<div class="alert alert-error"><a class="close" data-dismiss="alert">×</a><h4 class="alert-heading">TIME UP! PRESS PICK FOR NEW SPARRERS!</h4></div>'
                $(warning).appendTo(".clock-manual");

                $("#stop-timer").trigger("click");
            };
        },

        pick: function () {

            var self = this;

            if ( self._$userList.children().not(".used").length < 1) {
                self._$userList.children().removeClass("used");
            }


            var users = $(self._$userList.children().not(".used").get().sort(function(){ 
                  return Math.round(Math.random())-0.5
                }).slice(0,2)),
                clone = users.clone();

            clone.find(".close").remove();


            if ( self.hasUserSwapped ) {

                users.fadeOut(500, function () {
                    users.addClass("used");
                    var tmp = users.detach();

                    self._$userList.append(tmp);

                    tmp.fadeIn(500);

                    $(".coder").html(clone.eq(0).html());
                    $(".assist").html(clone.eq(1).html());
                });

                self.hasUserSwapped = false;
            } else {
                var tmp = $(".coder").html();
                $(".coder").html($(".assist").html());
                $(".assist").html(tmp);

                self.hasUserSwapped = true;
            }
            
            
        },

        _bindEvents: function () {
            var self = this;

            $("#pick-users").on("click", function () {
                self.pick();
                return false;
            });


            $("#amount-time").on("change", function () {
                $("#stop-timer").trigger("click");
            });

            $.subscribe("cd.userList", function (e, result) {
                self._renderUserList(result.data);
            });

            $("#toggle-timer").on("click", function () {

                if (self.timerIsGoing) {
                    canvasPieTimer.pause();
                    $(this).text("Start");
                } else {
                    canvasPieTimer.start();
                    $(this).text("Pause");
                }

                self.timerIsGoing = !self.timerIsGoing; // invert going
                return false;
            });

            $("#stop-timer").on("click", function () {
                var time = parseInt($("#amount-time").val(), 10);
                canvasPieTimer.timeLimit = time * 60 * 1000;
                canvasPieTimer.stop();

                self.timerIsGoing = false;
                $("#toggle-timer").text("Start");

                return false;
            });


            self._$userList.on('click', '[data-dismiss="user"]', function() {
                var id = $(this).parents("[data-id]").attr('data-id');
                $('#remove-user').modal('show');
                $('#remove-user').attr("data-id", id);
            });

            $('#remove-user').on('click', '.btn-primary', function() {
                var id = $(this).parents("[data-id]").attr('data-id');
                self._$userList.find('[data-id="'+id+'"]').remove();
                $('#remove-user').modal("hide");
            });

        },

        _renderUserList: function (userList) {
            var self = this,
                user, image, i, imageUrl;

            for (i = 0; i < userList.length; i++) {
                user = userList[i];
                imageUrl = "https://graph.facebook.com/"+user.id+"/picture";
                image = "<img alt='foo' src='"+imageUrl+"' />";
                $("<li />").attr("data-id", parseInt(user.id, 10))
                    .append(image).append("<span>" + user.name + '<a class="close" data-dismiss="user">×</a></span>')
                    .appendTo(self._$userList);
            }
        },

        _fetchUsers: function () {
            var url = "https://graph.facebook.com/198296253618610/attending?access_token=" + this.accessToken;
            return $.ajax(url).done(function (result) {
                $.publish("cd.userList", result);
            });
        },

        _ajaxSettings: function () {
            var self = this;

            $.ajaxSetup({
                type: "GET",
                dataType: "json",
                contentType: "application/json"
            });

            // Using jQuery for Ajax loading indicator - nothing to do with Knockout
            $(".loading-indicator").hide().ajaxStart(function () {
                var $this = $(this);
                self.isLoading = true;
                setTimeout(function () {
                    $this.fadeIn();
                }, 0);
            }).ajaxComplete(function () {
                var $this = $(this);
                setTimeout(function () {
                    $this.fadeOut();
                }, 0);
                self.isLoading = false;
            });
        }
    };


    return App;

    
})(jQuery, canvasPieTimer);



$(function () {
    var app = new App($("#user-list > ul"), $("#clock-box"), $("#sparring-box"));

    
    $('#remove-user').modal({
      show: false
    });
});

