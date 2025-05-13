public with sharing class LoginController {
    @AuraEnabled(cacheable=false)
    public static String validateUser(String email, String password) {
        List<AppUser__c> users = [
            SELECT Id, Username__c 
            FROM AppUser__c 
            WHERE Email__c = :email 
            AND Password__c = :password
            LIMIT 1
        ];
        return users.isEmpty() ? null : users[0].Username__c;
    }
}