public with sharing class ArticleController {
    @AuraEnabled(cacheable=true)
    public static List<AppArticle__c> getUserArticles(String email) {
        return [
            SELECT Id, Title__c, Content__c, Category__c, Email__c, Username__c
            FROM AppArticle__c
            WHERE Email__c = :email
            ORDER BY LastModifiedDate DESC
        ];
    }

    @AuraEnabled
    public static void deleteArticle(Id articleId) {
        delete [SELECT Id FROM AppArticle__c WHERE Id = :articleId LIMIT 1];
    }

    @AuraEnabled
    public static String createArticle(Map<String, Object> article) {
        try {
            AppArticle__c newArticle = new AppArticle__c();
            
            // Map fields explicitly
            newArticle.Title__c = (String)article.get('Title__c');
            newArticle.Content__c = (String)article.get('Content__c');
            newArticle.Category__c = (String)article.get('Category__c');
            newArticle.Email__c = (String)article.get('Email__c');
            newArticle.Username__c = (String)article.get('Username__c');
            newArticle.Name = (String)article.get('Name');
            
            // Set any required fields
            // newArticle.SomeRequiredField__c = 'Default Value';
            
            insert newArticle;
            return newArticle.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating article: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<AppArticle__c> getOtherUsersArticles(String currentEmail, String category) {
        String query = 'SELECT Id, Title__c, Content__c, Category__c, Email__c, Username__c, CreatedDate ' +
                       'FROM AppArticle__c ' +
                       'WHERE Email__c != :currentEmail ';
        
        if (String.isNotBlank(category)) {
            query += 'AND Category__c = :category ';
        }
        
        query += 'ORDER BY CreatedDate DESC';
        
        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getArticleCategories() {
        List<String> categories = new List<String>();
        Schema.DescribeFieldResult fieldResult = AppArticle__c.Category__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
        for(Schema.PicklistEntry f : ple) {
            categories.add(f.getLabel());
        }
        
        return categories;
    }

    @AuraEnabled
    public static void updateArticle(Map<String, Object> article) {
        try {
            AppArticle__c updatedArticle = [SELECT Id, Title__c, Content__c, Category__c FROM AppArticle__c WHERE Id = :((String)article.get('Id')) LIMIT 1];
        
            updatedArticle.Title__c = (String)article.get('Title__c');
            updatedArticle.Content__c = (String)article.get('Content__c');
            updatedArticle.Category__c = (String)article.get('Category__c');

            update updatedArticle;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating article: ' + e.getMessage());
        }
    }
}