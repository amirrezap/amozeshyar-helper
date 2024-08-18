const setRowCountElement = document.getElementById("setRowCount")
const setRowCountMessageElement = document.getElementById("setRowCountMessage")

chrome.storage.sync.get(['rowCount'])
    .then((settings) => {
        setRowCountElement.value = settings.rowCount ?? 50
    })
    .catch((error) => {
        console.error('Error retrieving settings:', error)
    });

setRowCountElement.addEventListener('change', function () {
    const rowCountValue = this.value;

    chrome.storage.sync.set({ rowCount: rowCountValue }).then(
        () => {
            setRowCountMessageElement.innerText = "ذخیره شد. برای اعمال برگه را refresh کنید"
            setTimeout(() => {
                setRowCountMessageElement.innerText = ""
            }, 1400)
        }
    )

});