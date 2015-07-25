(function($) {
  $.ajaxSetup({
      cache: true,
      statusCode: {
          406: function () {
              $("#msg").html("Error 406 请求速度过快！");
              $('#my-prompt').modal('open');
          },
          412: function () {
              $("#msg").html("Error 412 用户名或密码错误！");
              $('#my-prompt').modal('open');
          },
          404: function () {
              $("#msg").html("Error 404 系统没有对应服务接口！");
              $('#my-prompt').modal('open');
          },
          417: function () {
              $("#msg").html("Error 417 系统没有对应谓词接口！");
              $('#my-prompt').modal('open');
          }
      }
  });
    
  function mainViewModel() {
      var self = this;
      self.showuser = ko.observable(false);
      self.shownav = ko.observable(false);
      self.showuinfo = ko.observable(false);
      self.showback = ko.observable(false);
      self.uid = ko.observable("");
      self.pwd = ko.observable("");
      self.link_acuss = function () {
          go("web/ac_uss_page.html");
      };
      self.link_acaddus = function () {
          go("web/ac_addus_page.html");
      };
      self.link_account = function () {
          go("web/ac_page.html");
      };
      self.link_user_center = function () {
          go("web/center_page.html");
          self.showback(false);
      };
      self.rembme = ko.observable(false);
      if (typeof (Storage) !== "undefined") {
          if (localStorage.getItem("uid") !== null) {
              self.rembme(true);
              self.uid(localStorage.getItem("uid"));
              self.pwd(localStorage.getItem("pwd"));
          }
      }
      self.rembme.subscribe(function (val) {
          if (typeof (Storage) !== "undefined") {
              if (val) {
                  if (self.uid() !== "" && self.pwd() !== "") {
                      localStorage.setItem('uid', self.uid());
                      localStorage.setItem('pwd', self.pwd());
                      $("#msg").html("账号已记录在本机！");
                      $('#my-prompt').modal('open');
                  }
              } else {
                  localStorage.clear();
                  self.uid("");
                  self.pwd("");
              }
          } else {
              $("#msg").html("你的浏览器不支持此功能！");
              $('#my-prompt').modal('open');
          }
      });
      self.link_accountEditPwd = function () {
          go("web/acpwd_page.html");
      };
      
    self.link_user = function ()
    {
        if ($.AMUI.utils.cookie.get('uid') !== null)
        {
            $("#dialog").html("你确定想退出系统吗？");
            var $confirm = $('#exit-confirm');
            var confirm = $confirm.data('am.modal');
                var onConfirm = function () {
                $.AMUI.utils.cookie.set('uid', null);
                $.AMUI.utils.cookie.set('pwd', null);
                window.location = "/";
            };
            var onCancel = function () { };

            if (confirm) {
                confirm.options.onConfirm = onConfirm;
                confirm.options.onCancel = onCancel;
                confirm.toggle(this);
            } else {
                $confirm.modal({
                    relatedElement: this,
                    onConfirm: onConfirm,
                    onCancel: onCancel
                });
            }
        }
    };
      self.bt_login = function () 
      {
          if (self.uid() !== "" && self.pwd() !== "") 
          {
              $.AMUI.progress.start();
              $.ajax({
                  type:"POST",
                  url: "/user/login",
                  data:{'username' : self.uid(), 'pwd': self.pwd()}
              }).done(function (data) {
                    if (data)
                    {
                        $.AMUI.utils.cookie.set('uid', self.uid(), { expires: 7 });
                        $.AMUI.utils.cookie.set('pwd', self.pwd(), { expires: 7 });
                        $.AMUI.utils.cookie.set('data', data);
                          if (data.username === "admin")
                          {
                              self.showuser(true);
                          }
                      self.shownav(true);
                      go("web/center_page.html");
                  } else {
                      $("#msg").html("登陆失败");
                      $('#my-prompt').modal('open');
                      self.uid("");
                      self.pwd("");
                  }
                  $.AMUI.progress.done();
              }).fail(function (xhr) {
                  self.uid("");
                  self.pwd("");
                  $.AMUI.progress.done();
              });
          }
      };

      self.gopage = function (url) {};
  }
  ko.applyBindings(new mainViewModel(), document.getElementById("mainModel"));

  function go(url)
  {
      $("#render").load(url, null, function (res, status, xhr) {
          if ( status == "error" ) {
              var msg = "Sorry but there was an error: ";
              $( "#error" ).html( msg + xhr.status + " " + xhr.statusText );
          }
          console.log('load success');
      });
      $("#menu1").offCanvas('close');
  }

  window.onbeforeunload = function () 
  {
      $.AMUI.utils.cookie.set('ukey', null);
      $.AMUI.utils.cookie.set('uid', null);
      $.AMUI.utils.cookie.set('pwd', null);
  }

})($);

function centerViewModel() {
    var self = this;
    self.disLed2 = function() {
        $("#render").load("web/dis_led2_page.html");
    };
    self.disVolume = function() {
        $("#render").load("web/dis_volume_page.html");
    };
    self.disCam = function() {
        $("#render").load("web/dis_cam_page.html");
    };

    self.disAir = function() {
        $("#render").load("web/dis_air_page.html");
    };

    self.disTV = function() {
        $("#render").load("web/dis_tv_page.html");
    };

    self.switchChanged = function (dv) {
        var tempValue;
        if (dv.value === 1)
        {
            dv.value = 0;
            dv.imgValue(0);
            tempValue = dv.value;
            console.log("1 to ",tempValue);
            $("#msg").html("1 to "+tempValue);
            $('#my-prompt').modal('open');
        }else{
            dv.value = 1;
            dv.imgValue(1);
            tempValue = dv.value;
            console.log("0 to ", tempValue);
            $("#msg").html("0 to "+tempValue);
            $('#my-prompt').modal('open');

        }
        var switchData = '{"type":"switch","value":'+ dv.value+'}';

        $.ajax({
            type: "POST",
            //url: "/index.php/mqttdevices/"  + dv.id,
            url: "/devices/"  + dv.id,
            data: JSON.parse(switchData),
            success: function ()
            {
            },
            error: function (xhr, status, error)
            {
                $("#msg").html(xhr.responseText);
                $('#my-prompt').modal('open');
            }
        });
    };

    self.devices = ko.observableArray();

    self.loaddata = function ()
    {
        $.ajax({
            url: "/devices"
        }).done(function (data)
        {
            if (data.length === 0)
            {
                $("#render").load("web/nav_page.html");
            }
            else
            {
                if(0 === self.devices().length)
                {
                    for (var i = 0; i < data.length; i++)
                    {
                        data[i].description = decodeURI(data[i].description);

                        if("switch" === data[i].type)
                        {
                            data[i].imgValue = ko.observable( data[i].value );
                        }
                        self.devices.push(data[i]);
                    }
                }
                else
                {
                    // for (var i = 0; i < data.length; i++)
                    // {
                    //     self.devices()[i].value( Boolean(data[i].value) );
                    // };
                }
            }
        }).fail(function (xhr) {
        });
    };
}

var $topLoader; var controller;
function volumeViewModel()
{
    var self = this;
    // make the variables observable
    self.controller = ko.observable(0);
    self.switchValue = ko.observable(false);
    self.loaddata = function ()
    {
        $.ajax({
            url: "/devices/12"
        }).done(function (data)
        {
            var led2Value = $.parseJSON(data.value);// = ko.observable();
            self.switch =  Number(led2Value.switch) ;
            self.switchValue(Boolean(self.switch));
            self.controller(Number( led2Value.controller ));

            controller  = self.controller;

        });
    };
    self.volChanged = function ()
    {
        if (self.switch)
        {
            self.switch = 0;
            self.switchValue(false);
            console.log("1 to ",self.switch);
            $("#msg").html("1 to "+self.switch);
            $('#my-prompt').modal('open');
        }else{
            self.switch = 1;
            self.switchValue(true);
            console.log("0 to ",self.switch);
            $("#msg").html("0 to "+ self.switch);
            $('#my-prompt').modal('open');
        };

        var switchData = '{"type":"step","switch":' + Number(self.switch) +',"controller":'+Number(self.controller())+'}';
        $.ajax(
            {
                type: "POST",
                url: "/devices/12",
                data: switchData,
                success: function (subdata)
                {
                    if(self.switch)
                    {
                        $topLoader.percentageLoader({progress: Number(self.controller())/100 });
                    }
                }
            });
    }
}
// check out which radio is selected and run the function radioChange under event:change
$(function()
{
    $topLoader = $("#topLoader").percentageLoader({
        width: 256, height: 256, controllable: true, progress: 0,
        onProgressComplete: function (val)
        {
            var togswitch  = volViewModel.switch;
            if(togswitch)
            {
                controller(Math.round(val * 100.0));

                var controllerNumber = controller();
                var controllerData = '{"type":"step","switch":' + Number(togswitch) +',"controller":'+controllerNumber +'}';
                $.ajax(
                    {
                        type: "POST",
                        url: "/devices/12",
                        data: controllerData,
                        success : function (){console.log("post 12controller", controllerNumber );}
                    });
            }
        }
    });

    // add animation to the percentageLoader initial.
    var topLoaderRunning = false;
    $topLoader.percentageLoader({
        onready: function ()
        {
            if (topLoaderRunning) {
                return;
            }
            topLoaderRunning = true;
            var kb = 0;
            var animateFunc = function ()
            {
                var totalKb = controller()/100;
                kb += 0.02;
                if(kb >= totalKb)
                {
                    kb = totalKb;
                }
                $topLoader.percentageLoader({progress: kb });

                if (kb < totalKb) {
                    setTimeout(animateFunc, 25);
                } else {
                    topLoaderRunning = false;
                }
            };

            setTimeout(animateFunc, 300);
        }
    });

});