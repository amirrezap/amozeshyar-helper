function replaceYKSpace(str) {

    // A regular expression that matches any form of ی and ک in Persian letters
    // The Unicode range for Persian and Arabic letters is U+0600 - U+06FF
    // The Unicode code points for ی and ک are U+06CC and U+06A9 respectively
    // The Unicode code points for ي and ك are U+064A and U+0643 respectively
    // The regular expression uses the \u escape sequence to match Unicode characters
    // The regular expression also uses the \s escape sequence to match any whitespace character

    let regex = /[\u06CC\u06A9\u064A\u0643\s]/g;

    // Use the replace method to replace all matches with %
    let newStr = str.replace(regex, "%");

    return newStr;
}

function convertLetters(e) {
    const value = (e.target.value).trim()

    if (value === "%%" || value === "%" || value === "") {
        return
    }

    e.target.value = "%" + replaceYKSpace(value) + "%"
}

function convertDigits(input) {

    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    let output = "";
    for (let i = 0; i < input.length; i++) {
        let char = input[i];

        // Check if the character is a farsi digit
        let index = persianDigits.indexOf(char);
        if (index !== -1) {
            // Replace it with the corresponding latin (Persian-Khwarazmi) digit
            char = index.toString();
        }

        // Check if the character is an arabic digit
        index = arabicDigits.indexOf(char);
        if (index !== -1) {
            // Replace it with the corresponding latin (persian-khwarazmi) digit
            char = index.toString();
        }

        output += char;
    }

    return output;
}

function setRowCounts() {
    const rowCountElements = document.getElementsByName("parameter(rowCount)")

    chrome.storage.sync.get(['rowCount'])
        .then((settings) => {
            rowCountElements.forEach(el => el.value = settings.rowCount ?? 50)
        })
        .catch((error) => {
            console.error('Error retrieving settings:', error)
        });
}

function detective() {

    setRowCounts()

    const crsNameName = "parameter(f^crsName)"
    const crsNameID = document.getElementsByName("parameter(f^crsName)")[0]?.id
    const crsName = document.getElementById(crsNameID)

    const crsCodeName = "parameter(f^crsCode)"
    const crsCodeID = document.getElementsByName("parameter(f^crsCode)")[0]?.id
    const crsCode = document.getElementById(crsCodeID)

    crsName.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) {
            return;
        }
        if (e.key === "Enter" && e.target.name === crsNameName) {
            convertLetters(e)
            e.stopImmediatePropagation()
        }
    })

    crsCode.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) {
            return;
        }
        if (e.key === "Enter" && e.target.name === crsCodeName) {
            const value = convertDigits(e.target.value)
            e.target.value = value;
            e.stopImmediatePropagation()
        }
    })


    crsName.addEventListener("change", (e) => {
        e.target.name === crsNameName && convertLetters(e);
    })

    crsCode.addEventListener("change", (e) => {
        const value = convertDigits(e.target.value)
        e.target.value = value
    })

}

const jcaptcha = document.getElementsByName("jcaptcha")
if (jcaptcha.length > 0) {
    jcaptcha[0].addEventListener("change", (e) => {
        const value = convertDigits(e.target.value)
        e.target.value = value
    })
}

const OTP = document.getElementById("OTP")
if (OTP) {
    OTP.addEventListener("change", (e) => {
        const value = convertDigits(e.target.value)
        e.target.value = value
    })
}

const pathname = window.location.pathname

const isInHandleCourseClassSearchAction =
    pathname.includes("/handleCourseClassSearchAction")
    ||
    pathname.includes("/pSearchAction")
    ||
    pathname.includes("/operationalPropertiesAction")
    ||
    document.querySelector("legend")?.innerText === 'جستجوي كلاس درس'

if (isInHandleCourseClassSearchAction) {

    const inputs = document.getElementsByTagName("input")
    const inputsEntries = Object.entries(inputs)

    const hiddenFormMenuItem = "parameter(menuItem)"
    for ([key, value] of inputsEntries) {

        if (value.name.startsWith("parameter(") && value.name.endsWith("Name)")) {
            value.addEventListener("change", (e) => {
                hiddenFormMenuItem === value.name && convertLetters(e)
            })
        }

        if (value.name.startsWith("parameter(") && (value.name.endsWith("Code)") || value.name.endsWith("Id)"))) {
            value.addEventListener("change", (e) => {
                const value = convertDigits(e.target.value)
                e.target.value = value
            })
        }
    }

    const rowCountElement = document.getElementsByName("parameter(rowCount)")[0]

    chrome.storage.sync.get(['rowCount'])
        .then((settings) => {
            rowCountElement.value = settings.rowCount ?? 50
        })
        .catch((error) => {
            console.error('Error retrieving settings:', error)
        });


}
else if (
    pathname.includes("/registerationAction")
    ||
    (document.getElementsByName("parameter(f^crsName)")?.length > 0 && !!document.getElementsByName("parameter(f^crsName)")[0]?.id)
) {
    document.addEventListener("click", detective);
}
else if (pathname.includes("studentProffEvaluation")) {
    /**
     * 
     * @param {string} value 
     * @param {string[]} values 
     * @returns {boolean}
     */
    function isOneTheValues(value, values) {
        return values.some(item => item === value)
    }
    const tableHeaderValues = ['خیلی خوب', 'خوب', 'متوسط', 'قابل قبول', 'ضعیف']
    const headerTableData = [...document.querySelectorAll("td")].filter(td => isOneTheValues(td.innerText, tableHeaderValues))

    const inputs = [...document.querySelectorAll("input")].filter(item => item.name.startsWith("choice__"))

    function handleClickOnInputs(title) {
        inputs.forEach(input => {
            if (input.title === title) {
                input.click()
            }
        })
    }

    headerTableData.forEach(item => {
        const itemInnerText = item.innerText;
        item.innerText = item.innerText + "\n[انتخاب همه]";
        item.onclick = () => handleClickOnInputs(itemInnerText);
        item.style.cursor = 'pointer'
    })
}