


module.exports = function(opts){
	opts = opts || {};
	opts.delay = opts.delay || 0.1;
	var onOk= function(){},
		onIs= function(){},
		onerror = function(){},
		onfail = function(){},
		anyway = function(){},
		anyway_isexecuted = false,
		_notify = opts.notify || (module && module.isImported && module.isImported("notify")? module("notify") : undefined),
	result= {
		response : function(_res){
			if(_res){
				result.ok(_res.ok);
				result.fail(_res.fail);
				result.error(_res.error);
			}
			return result;
		},
		notify : function(){
			if(!_notify) throw new Error("please define notify in Result");
			onOk = function(res, msg){ _notify.ok(res.msg || msg || 'Ok');}
			onfail = function(res, msg){ _notify.error(res.msg || msg || 'Fail');}
			onerror = function(res, msg){ _notify.error(res.msg || msg || 'Error');}
			return result;
		},
		log : function(){
			onOk = function(res, msg){ console.log.apply(console, arguments);}
			onfail = function(res, msg){ console.error.apply(console, arguments);}
			onerror = function(res, msg){ console.error.apply(console, arguments);}
			return result;
		},
		callback : function(cb){
			if(!cb) throw "please define callback";
			result.ok(function(data, msg){
				cb({ok : true, error : null, msg : msg, data : data});
			});
			result.fail(function(data, msg){
				cb({ok : false, error : null, msg : msg, data : data});
			});
			result.error(function(error, msg){
				cb({ok : false, error : error, msg : msg, data : null});
			});
			return result;
		},
		evaluate : function(_res){
			if(!_res) return result;
			var args = [].slice.call(arguments);
			if(_res.error){
				onerror.apply(onerror, args);
			}else{
				if(!_res.ok) onfail.apply(onfail, args);
				if(_res.ok) onOk.apply(onOk, args);
			}
			return result;
		},
		anyway: function(cb,msg){
			if(typeof cb =="function") {
				anyway = cb;
				return result;
			}
			if(!anyway_isexecuted) anyway.apply(anyway,arguments);
			anyway_isexecuted = true;
			return result;
		},
		async: function(resultType, data, msg){
			if(!result[resultType]) return result;
			var args = [].slice.call(arguments);
			args.splice(0, 1);
			setTimeout( function(){
				result[resultType].apply(result[resultType], args);
			} , opts.delay);
			return result;
		},
		ok: function(cb,msg){
			if(typeof cb =="function") {
				onOk = cb;
				onIs = cb;
				return result;
			}
			onOk.apply(onOk,arguments);//onOk(cb,msg);
			if(!anyway_isexecuted) anyway.apply(anyway,arguments);
			return result;
		},
		is: function(cb,msg){
			if(typeof cb =="function") {
				onOk = cb;
				onIs = cb;
				return result;
			}
			onIs.apply(onIs,arguments);//onIs(cb,msg);
			if(!anyway_isexecuted) anyway.apply(anyway,arguments);
			return result;
		},
		error: function(cb,msg){
			if(typeof cb =="function") {
				onerror = cb;
				return result;
			}
			onerror.apply(onerror,arguments);//onerror(cb,msg);
			if(!anyway_isexecuted) anyway.apply(anyway,arguments);
			return result;
		},
		fail: function(cb,msg){
			if(typeof cb =="function"){
				onfail = cb;
				return result;
			}
			onfail.apply(onfail,arguments);//onfail(cb,msg);
			if(!anyway_isexecuted) anyway.apply(anyway,arguments);
			return result;
		}
	}
	return result;
}