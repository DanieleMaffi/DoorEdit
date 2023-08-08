# Attività Manutenzione

## Purpose of the app
This app is supposed to be easily accessible by all the employees of the company, either by pc or phone through the wifi network. <br>
The whole purpose of this app is to provide a **simple UI** that can be used to create orders for the maintenance department wothout going there physically.

### The orders
The **orders** have a specific position therefore it needs to be specified when creating the order, also with a brief description of the intervention needed. <br> The orders can also be examined in detail with a dedicated page.

### Features
The user can change the password both when logged in and when logged out, the latter will require them to type in their email and a message will respectively be sent to theie postbox with a brand *new* password.

----

## Structure

### The login
The login is managed by the **json webtoken** package that beyond being ecnrypted with a secret key, it also contains useful information to send between html pages. The tolen will **expire** in **1h**.

### The views
The views are handled by the package **ejs**, which renders html pages or `.ejs` with strctures appended to them. 
For example
```javascript
res.status(201).render('myhtmlpage', {
        message: 'This is a strcture'
    })
```
This variables can be acceseed from the view with a sepcific syntax like this:
```html
<% if(message) { %>
    <p><%=message%></p>
<% } %>
```

### The design
The design is built using the bootstrap framework and a little bit of simple custom CSS.

## TO DO
- [x] Scroll down arrow
- [x] Info page
- [x] Json session token
- [x] Refresh button
- [x] Access all info through token 
- [x] Change Password feature
- [x] Email from server side to change password
- [ ] Possibilty to add attachments
<br> <br> 

```
                 *       +
           '                  |
       ()    .-.,="``"=.    - o -        Made
             '=/_       \      |             by
          *   |  '=._    |                     D3nny
               \     `=./`,        '             
            .   '=.__.=' `='      *
   +                         +
        O      *        '       .
```