import { LightningElement, track } from 'lwc';
import getUserArticles from '@salesforce/apex/ArticleController.getUserArticles';
import deleteArticle from '@salesforce/apex/ArticleController.deleteArticle';
import createArticle from '@salesforce/apex/ArticleController.createArticle';
import updateArticle from '@salesforce/apex/ArticleController.updateArticle';


export default class MyArticles extends LightningElement {
    @track articles = [];
    @track filteredArticles = [];
    @track selectedCategory = '';
    @track selectedArticle = null;
    @track lastRenderedArticleId = null;
    @track error;
    @track isCreatingNew = false;
    @track isLoading = false;
    @track showSuccessMessage = false;
    @track successMessage = '';
    @track newArticle = {
        Title__c: '',
        Content__c: '',
        Category__c: ''
    };
    @track isEditing = false;

    connectedCallback() {
        const currentEmail = sessionStorage.getItem('currentEmail');
        if (currentEmail) {
            this.loadArticles(currentEmail);
        }
    }


    handleTitleClick(event) {
        const articleId = event.target.dataset.id;
        const found = this.filteredArticles.find(article => article.Id === articleId);
        this.selectedArticle = found;
        this.isCreatingNew = false;
        this.isEditing = false; 
        // Clear the form data
        this.newArticle = {
            Title__c: '',
            Content__c: '',
            Category__c: ''
        };
        this.lastRenderedArticleId = null;
    }

    loadArticles(email) {
        getUserArticles({ email })
            .then(result => {
                this.articles = result;
                this.filteredArticles = result;
            })
            .catch(error => {
                this.error = error;
                console.error('Error loading articles', error);
            });
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.target.value;
        this.filteredArticles = this.selectedCategory
            ? this.articles.filter(article => article.Category__c === this.selectedCategory)
            : this.articles;
        this.selectedArticle = null;
        this.lastRenderedArticleId = null;
    }

    handleDelete(event) {
        const articleId = event.target.dataset.id;
        this.isLoading = true;
        this.showSuccessMessage = false;
        deleteArticle({ articleId })
            .then(() => {
                this.loadArticles(sessionStorage.getItem('currentEmail'));
                this.selectedArticle = null;
                this.lastRenderedArticleId = null;
                // Clear the form data
              　this.newArticle = {
                    Title__c: '',
                    Content__c: '',
                    Category__c: ''
                };
                // Show Japanese delete message
                this.selectedCategory = '';
                this.showSuccessMessage = true;
                this.successMessage = '記事が削除されました。';
                // Hide after 5 seconds
                setTimeout(() => {
                    this.showSuccessMessage = false;
                }, 5000);
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', '記事の削除に失敗しました', 'error');

            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleEdit(event) {
        this.isEditing = true;
        this.newArticle = {
            Id: this.selectedArticle.Id,
            Title__c: this.selectedArticle.Title__c,
            Content__c: this.selectedArticle.Content__c,
            Category__c: this.selectedArticle.Category__c
        };

    }

    handleUpdateArticle() {
        this.isEditing = false
        this.isLoading = true;
        this.showSuccessMessage = false;
    
        updateArticle({ article: this.newArticle })
            .then(() => {
                
                this.showSuccessMessage = true;
                this.successMessage = '記事が更新されました。';
                this.isEditing = false;
                this.selectedArticle = null;
                this.newArticle = { Title__c: '', Content__c: '', Category__c: '' };
                this.loadArticles(sessionStorage.getItem('currentEmail'));
                setTimeout(() => {
                    this.showSuccessMessage = false;
                }, 3000);
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || '更新に失敗しました', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    

    handleCreateNew() {
        this.isCreatingNew = true;
        this.isEditing = false; 
        this.selectedArticle = null;
        // Clear the form data
        this.newArticle = {
            Title__c: '',
            Content__c: '',
            Category__c: ''
        };
    }

    handleNewTitleChange(event) {
        this.newArticle.Title__c = event.target.value;
    }

    handleNewContentChange(event) {
        this.newArticle.Content__c = event.target.value;
    }
    
    handleNewCategoryChange(event) {
        this.newArticle.Category__c = event.target.value;
    }

    handleSaveNewArticle() {
        const email = sessionStorage.getItem('currentEmail');
        const username = sessionStorage.getItem('currentUser'); 
    
        const articleData = { 
            Title__c: this.newArticle.Title__c,
            Content__c: this.newArticle.Content__c,
            Category__c: this.newArticle.Category__c,
            Email__c: email,
            Username__c: username,
            Name: 'ウェブサイト' 
        };

        this.isLoading = true;
        this.showSuccessMessage = false;
    
        createArticle({ article: articleData })
            .then(articleId => {
                // 1. Close the form immediately
                this.isCreatingNew = false;
                // 2. Clear the form fields
                this.newArticle = {
                    Title__c: '',
                    Content__c: '',
                    Category__c: ''
                };
                // Show Japanese success message
                this.showSuccessMessage = true;
                this.successMessage = '記事が正常に保存されました。ありがとうございます。';
                //this.showToast('Success', 'Article created successfully', 'success');
                // Hide after 5 seconds
                setTimeout(() => {
                    this.showSuccessMessage = false;
                }, 2000);
                // 5. Reload articles to show the new one
                this.loadArticles(email);
            })
            .catch(error => {
                console.error('Error details:', JSON.stringify(error));
                this.showToast('Error', error.body?.message || 'Failed to create article', 'error');
            })
            .finally(() => {
                // Reset loading state
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }


    get categoryOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'Networking', value: 'Networking' },
            { label: 'Cybersecurity', value: 'Cybersecurity' },
            { label: 'Cloud Computing', value: 'Cloud Computing' },
            { label: 'Software Development', value: 'Software Development' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'Others', value: 'Others' },
        ];
    }
}