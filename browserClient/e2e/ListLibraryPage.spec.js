var ListLibraryPage = function () {

    this.updateFteButton = element(by.id('update-fte'));
    this.editFteModal = element(by.id('edit-fte-modal'));

    this.testLibrary = {
        name: 'Test Library 1',
        fte: '0'
    };
};

module.exports = ListLibraryPage;
