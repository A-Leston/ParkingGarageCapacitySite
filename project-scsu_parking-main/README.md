SCSU Parking
=====

#### Team: Ariel Leston, Caroline Kohnert, Paul Rosenberg, Nathan Riddle

## Features:
* Current occupancies by percent for each garage
* Floor-by-floor vacancies for each garage
* Toggle between Student and Faculty to filter relevant garage data
* Login for admin accounts (sample credentials: username = "nodeuser" , password = "nodepass")
* Admin dashboard with functions to create a new admin account, update floor occupancies, and simulate garage floor sensors


## How to Use:
1. Clone repo
2. Ensure relevant software/packages are installed on your machine:
   * Node.js environment
   * npm (to install bcrypt and mysql)
   * bcrypt library
   * mysql module

3. Change the value of `const urlPrefix` at the top of each client .js files to store your machine's external IP address as a string, including "http://" (e.g. `const urlPrefix = "http://35.243.163.3";`):
   * [admin.js](/public_html/js/admin.js)
   * [garages.js](/public_html/js/garages.js)
   * [login.js](/public_html/js/login.js)

4. Run `node app.js`, open your browser, and navigate to the address you entered above



