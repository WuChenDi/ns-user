import { Hono } from 'hono';
import type { FC } from 'hono/jsx';

export const clientRoute = new Hono();

const Layout: FC = props => {
  return (
    <html>
      <head>
        <title>OAuth2 Login</title>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const Top: FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  const state = crypto.randomUUID();

  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map(message => {
          return <li>{message}!!</li>;
        })}
      </ul>
      <div>
        <div>
          <label>Auth URL:</label>
          <input id="auth" type="text" placeholder="https://domain.cc/oauth2/auth" />
        </div>
        <div>
          <label>Redirect URI:</label>
          <input id="redirect_uri" type="text" placeholder="https://domain.cc/client" />
        </div>
        <div>
          <label>Client ID:</label>
          <input id="client_id" type="text" placeholder="Enter your client ID" />
          {/* 00278898-b92b-40b2-b8c3-f617e16d8d0e */}
        </div>
        <div>
          <label>Response Type:</label>
          <input id="response_type" type="text" value="code" />
        </div>
        <div>
          <label>Scope:</label>
          <input id="scope" type="text" value="openid" />
        </div>
        <button id="loginBtn">Login with OAuth2</button>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const currentUrl = window.location;
            const protocol = currentUrl.protocol;
            const host = currentUrl.host;
            
            const authInput = document.getElementById('auth');
            if (!authInput.value) {
              authInput.value = protocol + '//' + host + '/oauth2/auth';
            }
            
            const redirectInput = document.getElementById('redirect_uri');
            if (!redirectInput.value) {
              redirectInput.value = protocol + '//' + host + '/client';
            }
          });

          function handleLogin() {
            console.log('Login button clicked');
            const auth = document.getElementById('auth').value;
            const redirect_uri = document.getElementById('redirect_uri').value;
            const client_id = document.getElementById('client_id').value;
            const response_type = document.getElementById('response_type').value;
            const scope = document.getElementById('scope').value;

            if (!auth || !redirect_uri || !client_id) {
              alert('Please fill in Auth URL, Redirect URI, and Client ID');
              return;
            }

            const state = '${state}';

            const authUrl = \`\${auth}?client_id=\${client_id}&redirect_uri=\${redirect_uri}&response_type=\${response_type}&scope=\${scope}&state=\${state}\`;
            window.location.href = authUrl;
          }

          document.getElementById('loginBtn').addEventListener('click', handleLogin);
        `
      }} />
    </Layout>
  );
};

clientRoute.get('/', c => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night'];
  return c.html(<Top messages={messages} />);
});
