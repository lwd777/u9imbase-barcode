/*! 
 * 
 * Copyright 2017 u9mobile. 
 * 
 * u9imbase-barcode, v1.0.0 
 * 智能工厂移动应用-Base_Barcode库 
 * 
 * By @lwd 
 * 
 * Licensed under the MIT license. Please see LICENSE for more information. 
 * 
 */

(function($, u9) {

    function BarCodeServices() {

    };

    //获取已选组织
    BarCodeServices.prototype.getOrgCode = function() {
        var org = JSON.Parse(window.localStorage.getItem("U9ImPDA_org"));
        var orgCode = '';
        if (org) {
            orgCode = org.Code;
        }
        if (!orgCode && u9.User('Orgs')) {
            orgCode = u9.User('Orgs')[0].Code;
            if (!org) {
                window.localStorage.setItem("U9ImPDA_org", JSON.stringify(u9.User('Orgs')[0]));
            }
        }
        return orgCode;
    };

    //条码解析 接口
    BarCodeServices.prototype.barCodeAnalyze = function(dataInfo, successFn, errorFn) {
        this.context = getContext();
        var cfg = {};
        //地址
        cfg.url = getAbsoluteURL('/api/barcodeinfo/getBarCodeInfo');
        cfg.data = {
            Parameter: {
                BarCode: dataInfo.BarCode, //条码
                OpType: dataInfo.OpType, //操作类型
                DocTypeEnum: dataInfo.DocTypeEnum, //单据类型
                EntCode: this.context.entCode, //企业
                OrgCode: this.context.orgCode, //组织
                UserCode: this.context.userCode, //用户Code
                CultureName: this.context.sysMLFlag,
                OperationKey: dataInfo.OperationKey //操作关键字 必须传
            }
        };
        cfg.success = function(data) {
            successFn && successFn(data);
        };
        cfg.errorFn = function(err) {
            errorFn && errorFn(err);
        };

        httpPost(cfg);
    };

    //料品条码解析接口
    BarCodeServices.prototype.barCodeAnalyzeOnlyItemBC = function(barcode, successFn, errorFn) {
        this.context = getContext();
        var cfg = {};
        //地址
        cfg.url = getAbsoluteURL('/api/barcodeinfo/getBarCodeInfo');
        cfg.data = {
            Parameter: {
                BarCode: barcode, //条码
                OpType: 'BC_P_BarCodeAnalyze_Item_PDA', //操作类型
                DocTypeEnum: -1, //单据类型
                EntCode: this.context.entCode, //企业
                OrgCode: this.context.orgCode, //组织
                UserCode: this.context.userCode, //用户Code
                CultureName: this.context.sysMLFlag,
                OperationKey: 'QuickTransIn_BarCodeAnalyze' //操作关键字 必须传
            }
        };
        cfg.success = function(data) {
            successFn && successFn(data);
        };
        cfg.errorFn = function(err) {
            errorFn && errorFn(err);
        };

        httpPost(cfg);
    };

    //条码生单接口
    BarCodeServices.prototype.createDoc = function(dataInfo, successFn, errorFn) {
        this.context = getContext();
        var newDate = new Date();
        var cfg = {};
        //地址
        cfg.url = getAbsoluteURL('/api/barcodeinfo/CreateRcvRecord');
        cfg.data = {
            Parameter: {
                OpType: dataInfo.OpType, //操作类型
                DocType: dataInfo.DocTypeEnum, //单据类型
                CultureName: this.context.sysMLFlag, //语音 zh-CN
                EntCode: this.context.entCode, //企业 Code
                OrgCode: this.context.orgCode, //组织 Code
                UserCode: this.context.userCode, //用户 Code U9
                RcvUser: u9.User('_id'), //操作员 ID 智能工厂
                CreatedBy: this.context.userCode,
                RcvDateTime: newDate, //操作时间
                CreateDocJSON: dataInfo.CreateDocJSON, //生单JSON
                DocDetialList: dataInfo.DocDetailList, //明细结构
                OperationKey: dataInfo.OperationKey,
                IfWhTrans: dataInfo.IfWhTrans, //标识是否出入库相关，存储到不同的表中
                // Barcode: dataInfo.Barcode,    //条码
                AppKey: dataInfo.AppKey, //当前APP名称
                DocCode: dataInfo.DocCode, //单据编码
                OperType: dataInfo.OperType, //操作类型：0，创建单据；1，审核单据，2，创建并审核单据
                SourceDocNum: dataInfo.SourceDocNum, //来源单号
                BizOrgName: dataInfo.BizOrgName,
                Direction: dataInfo.Direction
            }
        };
        cfg.success = function(data) {
            successFn && successFn(data);
        };
        cfg.errorFn = function(err) {
            errorFn && errorFn(err);
        };

        httpPost(cfg);
    };

    //获取存储地点
    BarCodeServices.prototype.getWarehouseList = function(orgCode, successFn, errorFn) {
        var cfg = {};
        //地址
        cfg.url = getAbsoluteURL('/api/barcodeInfo/getWarehouseList');
        cfg.data = {
            Parameter: {
                orgCode: orgCode //组织
            }
        };
        cfg.success = function(data) {
            successFn && successFn(data);
        };
        cfg.errorFn = function(err) {
            errorFn && errorFn(err);
        };

        httpPost(cfg);
    };

    //获取库位
    BarCodeServices.prototype.getBinList = function(orgCode, wh, successFn, errorFn) {
        var cfg = {};
        //地址
        cfg.url = getAbsoluteURL('/api/barcodeInfo/getBinList');
        cfg.data = {
            Parameter: {
                orgCode: orgCode,
                wh: wh
            }
        };
        cfg.success = function(data) {
            successFn && successFn(data);
        };
        cfg.errorFn = function(err) {
            errorFn && errorFn(err);
        };

        httpPost(cfg);
    };

    //跟据单位进行 精度处理
    BarCodeServices.prototype.fnRoundValue = function(selfValue, precision, roundType, roundValue) {
        if (!selfValue) {
            return "0";
        }
        var tValue = '';

        //不含小数点 时  精度为0 不处理 精度不为0 补齐小数位 直接返回
        if (String(selfValue).indexOf('.') === -1) {
            if (precision === 0) {
                return selfValue;
            }

            tValue = selfValue + '.' + fnPrecision(precision);
            return tValue;
        }

        //先截取 小数点 后的位数 小于 要处理的精度位数 则补齐0
        if (selfValue.substring(selfValue.indexOf('.') + 1).length < Number(precision)) {
            var len = Number(precision) - selfValue.substring(selfValue.indexOf('.') + 1).length;
            var zero = '0';
            for (var i = 1; i < len; i++) {
                zero += '0';
            }
            selfValue = selfValue + zero;
            return selfValue;
        }

        //传的值 小数位数多于 要处理的精度

        //处理精度后的数值 总长度  包含小数点的长度 1.00 为3
        //indexOf返回某个指定的字符串值在字符串中首次出现的位置 从0开始
        var temp_position = selfValue.indexOf('.') + Number(precision);

        //头串  substring从0 开始截取几位
        var temp_head = selfValue.substring(0, Number(temp_position) + 1);
        //需要判断舍入的数值
        var temp_middlenext = selfValue.substring(Number(temp_position) + 1, Number(temp_position) + 2);
        //尾串
        var temp_tail = selfValue.substring(Number(temp_position) + 1, selfValue.length);

        //全部进位
        if (Number(roundType) === 0) {
            var aaa = '1' + Number(temp_tail);
            var bbb = '1' + fnPrecision(selfValue.length - 1 - temp_position);
            var ccc = accSub(aaa, bbb);

            if (ccc > 0) {
                var xxx = '';
                if (Number(precision) === 0) {
                    xxx = '1';
                } else {
                    xxx = '0.' + fnPrecision(precision - 1) + '1';
                }
                tValue = accAdd(temp_head, xxx);
            } else {
                //增加精度为0 时处理
                if (precision === 0) {
                    //精度为0 时不+1 因为 返回值不带小数点
                    tValue = selfValue.substring(0, temp_position);
                } else {
                    tValue = selfValue.substring(0, temp_position + 1);
                }
            }
        }
        //全部舍位
        else if (Number(roundType) === 1) {
            tValue = selfValue.substring(0, temp_position + 1);
        }
        //按值舍入
        else if (Number(roundType) === 2) {
            if (Number(temp_middlenext) < roundValue) {
                tValue = selfValue.substring(0, temp_position + 1);
            } else {
                var yyy = '0';
                if (Number(precision) === 0) {
                    yyy = '1';
                } else {
                    yyy = '0.' + fnPrecision(precision - 1) + '1';
                }

                if (Number(selfValue) > 0) {
                    tValue = accAdd(temp_head, yyy);
                } else {
                    tValue = accSub(temp_head, yyy);
                }
            }
        }

        return tValue;
    };

    //加法函数
    BarCodeServices.prototype.accAdd = function(num1, num2) {
        var r1 = 0,
            r2 = 0,
            m;
        var a1 = String(num1).split(".");
        if (a1 && a1.length > 0 && a1[1]) {
            r1 = a1[1].length;
        }

        var a2 = String(num2).split(".");
        if (a2 && a2.length > 0 && a2[1]) {
            r2 = a2[1].length;
        }

        m = Math.pow(10, Math.max(r1, r2));
        return (num1 * m + num2 * m) / m;
    };

    //减法函数
    BarCodeServices.prototype.accSub = function(num1, num2) {
        var r1 = 0,
            r2 = 0,
            m, n;
        var a1 = String(num1).split(".");
        if (a1 && a1.length > 0 && a1[1]) {
            r1 = a1[1].length;
        }

        var a2 = String(num2).split(".");
        if (a2 && a2.length > 0 && a2[1]) {
            r2 = a2[1].length;
        }

        m = Math.pow(10, Math.max(r1, r2));
        //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return ((num1 * m - num2 * m) / m).toFixed(n);
    };

    //http请求
    function httpPost(cfg) {
        cfg.type = 'POST';
        httpAjax(cfg);
    };

    function httpAjax(ajaxInfo) {
        //定义默认值
        var defaultInfo = {
            type: "GET", //访问方式：如果dataPata不为空，自动设置为POST；如果为空设置为GET。
            dataType: 'JSON', //数据类型：JSON、JSONP、text。由配置信息来搞定，便于灵活设置
            cache: true, //是否缓存，默认缓存
            // xhrFields: {
            //     //允许跨域访问时添加cookie。cors跨域的时候需要设置
            //     withCredentials: true
            // },
            urlPata: {}, //url后面的参数。一定会加在url后面，不会加到form里。
            formPata: {}, //表单里的参数。如果dataType是JSON，一定加在form里，不会加在url后面；如果dataType是JSONP的话，只能加在url后面。

            //url:  //依靠上层指定

            //timeout: 2000,
            error: function(err) {}, //如果出错，停止加载动画，给出提示。也可以增加自己的处理程序

            success: function(data) {} //成功后显示debug信息。也可以增加自己的处理程序
        };

        //补全ajaxInfo
        if (typeof ajaxInfo.dataType == "undefined") {
            ajaxInfo.dataType = defaultInfo.dataType;
        }

        if (typeof ajaxInfo.type == "undefined") {
            ajaxInfo.type = "GET";
        } else {
            if (ajaxInfo.dataType == "JSON") {
                ajaxInfo.type = "POST";
            } else { //get或者jsonp
                ajaxInfo.type = "POST";
            }
            ajaxInfo.data = ajaxInfo.type;

        }

        if (typeof ajaxInfo.cache == "undefined") {
            ajaxInfo.cache = defaultInfo.cache;
        }

        //处理URL
        if (typeof ajaxInfo.urlPata != "undefined") {
            var tmpUrlPara = "";
            var para = ajaxInfo.urlPata;
            for (var key in para) {
                tmpUrlPara += "&" + key + "=" + para[key];
            }

            if (ajaxInfo.url.indexOf('?') >= 0) {
                //原地址有参数，直接加
                ajaxInfo.url += tmpUrlPara;
            } else {
                //原地址没有参数，变成?再加
                ajaxInfo.url += tmpUrlPara.replace('&', '?');
            }
        }

        //开始执行ajax
        axios.request({
                method: ajaxInfo.type,
                responseType: ajaxInfo.dataType,
                url: ajaxInfo.url,
                data: ajaxInfo.data,
                timeout: 1800000
            }).then(function(response) {
                ajaxInfo.success(response.data.Data);
            })
            .catch(function(err) {
                if (typeof ajaxInfo.errorFn == "function") ajaxInfo.errorFn(err);
            });;
    };

    //取上下文函数
    function getContext() {

        var errMessage = '';
        var data = {};
        var org = JSON.parse(window.localStorage.getItem("U9ImPDA_org"));
        var orgCode = '';
        if (org) {
            orgCode = org.Code;
        }
        if (!orgCode && u9.User('Orgs')) {
            orgCode = u9.User('Orgs')[0].Code;
            if (!org) {
                window.localStorage.setItem("U9ImPDA_org", JSON.stringify(u9.User('Orgs')[0]));
            }
        }
        if (!orgCode) {
            errMessage = '智能工厂未定义用户的ERP组织，PDA读取设置组织失败！';
        } else {
            data.orgCode = orgCode;
        }
        var entCode = u9.User('Orgs')[0].ErpEntCode;
        if (!entCode) {
            errMessage = '智能工厂未定义用户上的ERP企业编码，PDA读取ERP企业编码失败！';
        } else {
            data.entCode = entCode;
        }
        var userCode = u9.User('Orgs')[0].ErpUserCode;
        if (!userCode) {
            errMessage = '智能工厂未定义用户的ERP用户编码，PDA读取ERP用户编码失败！';
        } else {
            data.userCode = userCode;
        }
        data.sysMLFlag = 'zh-CN';

        return data;
    };

    //取绝对地址 URL
    function getAbsoluteURL(url) {
        var address = u9.Connect('address'),
            port = u9.Connect('port');
        if (!address || !port) {
            return null;
        } else {
            return 'http://' + address + ':' + port + url;
        }
    };

    //0补函数
    function fnPrecision(vP) {
        var reValue = '';
        for (var i = 0; i < vP; i++) {
            reValue += '0';
        }
        return reValue;
    };

    window.BarCodeServices = new BarCodeServices();

})(axios, window.u9);
