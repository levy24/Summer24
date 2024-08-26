const login = document.getElementById('login');
const register = document.getElementById('register');
const btn = document.getElementById('submit');

login.classList.add('border-title');

function change(active) {
    if (active == "register") {
        document.querySelector(".retypepassword").style.display = 'block';
        register.classList.add('border-title');
        login.classList.remove('border-title');
    } else {
        login.classList.add('border-title');
        register.classList.remove('border-title');
        document.querySelector(".retypepassword").style.display = 'none';
    }
    active == "login" ? btn.textContent = "Login" : btn.textContent = "Register";
    document.querySelector(".error").style.display = "none";
    document.querySelector('.username span').style.display = "none";
    document.querySelector('.password span').style.display = "none";
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('retypepassword').value = '';
}

register.addEventListener('click', () => { change('register') })
login.addEventListener('click', () => { change('login') })

function User(email, password) {
    this.email = email;
    this.password = password;
}

function getUsers() {
    if (localStorage.getItem("users")) {
        return JSON.parse(localStorage.getItem("users"));
    } else {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}


btn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const retypepassword = document.getElementById('retypepassword').value;

    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Retype Password:', retypepassword);

    if (email === '') {
        document.querySelector('.username span').style.display = "block";
        return;
    }
    if (password === '') {
        document.querySelector('.password span').style.display = "block";
        return;
    }

    if (btn.textContent === "Login") {
        // Đăng nhập
        const users = getUsers();
        console.log('Stored Users:', users);

        const user = users.find(user => user.email === email && user.password === password);
        console.log('Found User:', user);

        if (user) {
            window.location.href = '../home/index.html';
        } else {
            document.querySelector(".error").style.display = "block";
        }
    } else {
        // Đăng ký
        if (retypepassword !== password) {
            document.querySelector('.retypepassword span').style.display = 'block';
            return;
        }
        const newUser = new User(email, password);
        const users = getUsers();
        users.push(newUser);
        saveUsers(users);
        change("login");
    }
});
