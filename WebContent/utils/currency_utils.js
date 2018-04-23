var CurrencyUtils = (function() {

    return {

	parseCurrency : function(val) {

	    if (val.indexOf(",") != -1) {
		val = val.replace(".", "");
	    }
	    val = val.replace(",", ".");
	    return parseFloat(val);
	},

	formatCurrency : function(val) {

	    if(typeof val == "string") {
		val = parseFloat(val);
	    }
	    
	    return val.toLocaleString(val, {
		useGrouping : true,
		minimumFractionDigits : 2,
		maximumFractionDigits : 2
	    });
	}
    }

})();