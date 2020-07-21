const setValue = (property, value) => {
    if (value) {
        document.documentElement.style.setProperty(`--${property}`, value);

        const input = document.querySelector(`#${property}`);
        if (input) {
            value = value.replace('px', '');
            input.value = value;
        }
    }
};

const setValueFromLocalStorage = property => {
    let value = localStorage.getItem(property);
    setValue(property, value);
};

const setTheme = options => {
    for (let option of Object.keys(options)) {
        const property = option;
        const value = options[option];

        setValue(property, value);
        localStorage.setItem(property, value);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setValueFromLocalStorage('color-background');
    setValueFromLocalStorage('color-text-pri');
    setValueFromLocalStorage('color-text-acc');
});

const dataThemeButtons = document.querySelectorAll('[data-theme]');

for (let i = 0; i < dataThemeButtons.length; i++) {
    dataThemeButtons[i].addEventListener('click', () => {
        const theme = dataThemeButtons[i].dataset.theme;

        switch (theme) {
            case 'blackboard':
                setTheme({
                    'color-background': '#1a1a1a',
                    'color-text-pri': '#FFFDEA',
                    'color-text-acc': '#5c5c5c'
                });
                return;

            case 'gazette':
                setTheme({
                    'color-background': '#F2F7FF',
                    'color-text-pri': '#000000',
                    'color-text-acc': '#5c5c5c'
                });
                return;

            case 'espresso':
                setTheme({
                    'color-background': '#21211F',
                    'color-text-pri': '#D1B59A',
                    'color-text-acc': '#4E4E4E'
                });
                return;

            case 'cab':
                setTheme({
                    'color-background': '#F6D305',
                    'color-text-pri': '#1F1F1F',
                    'color-text-acc': '#424242'
                });
                return;

            case 'cloud':
                setTheme({
                    'color-background': '#f1f2f0',
                    'color-text-pri': '#35342f',
                    'color-text-acc': '#37bbe4'
                });
                return;

            case 'lime':
                setTheme({
                    'color-background': '#263238',
                    'color-text-pri': '#AABBC3',
                    'color-text-acc': '#aeea00'
                });
                return;

            case 'white':
                setTheme({
                    'color-background': '#ffffff',
                    'color-text-pri': '#222222',
                    'color-text-acc': '#dddddd'
                });
                return;

            case 'tron':
                setTheme({
                    'color-background': '#242B33',
                    'color-text-pri': '#EFFBFF',
                    'color-text-acc': '#6EE2FF'
                });
                return;

            case 'blues':
                setTheme({
                    'color-background': '#2B2C56',
                    'color-text-pri': '#EFF1FC',
                    'color-text-acc': '#6677EB'
                });
                return;

            case 'passion':
                setTheme({
                    'color-background': '#f5f5f5',
                    'color-text-pri': '#12005e',
                    'color-text-acc': '#8e24aa'
                });
                return;

            case 'chalk':
                setTheme({
                    'color-background': '#263238',
                    'color-text-pri': '#AABBC3',
                    'color-text-acc': '#FF869A'
                });
                return;

            case 'paper':
                setTheme({
                    'color-background': '#F8F6F1',
                    'color-text-pri': '#4C432E',
                    'color-text-acc': '#AA9A73'
                });
                return;

        }
    })
}

Iconify.addCollection({
    "prefix": "custom",
    "icons": {
        "jellyfin": {
            "body": "<g fill=\"currentColor\" fill-rule=\"evenodd\"><path id=\"inner-shape\" d=\"M12.0012713844 9.45471264461C11.0464630524 9.45471264461 7.96673813844 15.0384692136 8.43478143844 15.9792362466C8.90282473844 16.92000342 15.1043984634 16.910642554 15.5677613304 15.9792362466C16.0311241974 15.0478300796 12.9607601494 9.45471264461 12.0012713844 9.45471264461C12.0012713844 9.45471264461 12.0012713844 9.45471264461 12.0012713844 9.45471264461\"/><path id=\"outer-shape\" d=\"M12.0012713844 1.10950074602C9.11812465644 1.10950074602 -0.158493409151 17.930976948 1.25499735685 20.771999779C2.66848812285 23.61302261 21.3480960854 23.580259579 22.7475455524 20.771999779C24.1469950194 17.963739979 14.8844181124 1.10950074602 12.0012713844 1.10950074602C12.0012713844 1.10950074602 12.0012713844 1.10950074602 12.0012713844 1.10950074602M19.0453230494 18.310092021C18.1279581814 20.14950219 5.88862588644 20.172904355 4.96190015244 18.310092021C4.03517441844 16.447279687 10.1150568854 5.42485997202 12.0012713844 5.42485997202C13.8874858834 5.42485997202 19.9626879174 16.466001419 19.0453230494 18.310092021C19.0453230494 18.310092021 19.0453230494 18.310092021 19.0453230494 18.310092021\"/></g>"
        },
    },
    "width": 24,
    "height": 24
});