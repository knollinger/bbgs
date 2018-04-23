var UUID = (function() {

    var givenIds = {};
    
    return {
        
        create : function(domain) {
            
            if(givenIds[domain] == null) {
                givenIds[domain] = 0;
            }
            
            givenIds[domain] += 1;
            return domain + "_" + givenIds[domain];
        }
    }
    
})();
