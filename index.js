const App = (() => {

  const NavController = document.querySelector('ion-nav');
  const parseJson = (str) => JSON.parse(str);
  const toJson = (obj) => JSON.stringify(obj);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Rxjs
   */
  const { Subject, from, fromEvent } = rxjs;
  const { tap, distinctUntilChanged, map, switchMap, filter, take, finalize } = rxjs.operators;

  /** Global Subject */
  const onMessage$ = new Subject();
  const onMessage = onMessage$.asObservable();

  /**
   * Services
   */
  class _StorageService {

    constructor() {
      this.storage = window.sessionStorage;
    }

    setItem(key, value) {
      this.storage.setItem(key, toJson(value));
    }

    getItem(key) {
      return parseJson(this.storage.getItem(key));
    }
  }
  const StorageService = new _StorageService();

  /**
   * 
   */
  class _ApiService {

    baseUrl = "http://localhost:3000/api/v1";

    constructor() {
      this.storage = StorageService;
    }

    get (endpoint, overrides) {
      overrides = overrides || ((headers) => headers);

      return fetch(new Request(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: overrides(this.defaultHeaders)
      }));
    }

    post (endpoint, body, overrides) {
      overrides = overrides || ((headers) => headers);

      return fetch(new Request(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        body: body instanceof FormData ? body : toJson(body),
        mode: 'cors',
        cache: 'no-cache',
        headers: overrides(this.defaultHeaders)
      }));
    }

    delete (endpoint, overrides) {
      overrides = overrides || ((headers) => headers);

      return fetch(new Request(`${this.baseUrl}/${endpoint}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        headers: overrides(this.defaultHeaders)       
      }))
    }

    get defaultHeaders() {
      return new Headers({
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...this.storage.getItem('auth')
      })
    }
  }
  const ApiService = new _ApiService();

  /**
   * 
   */
  class _DocumentService {

    constructor() {
      this.api = ApiService;
    }

    getDocuments() {
      return this.api.get('documents');
    }

    createDocument(formData) {
      return this.api.post('documents', formData, (headers) => {
        headers.delete("Content-Type");
        return headers;
      });
    }

    destroyDocument(documentId) {
      return this.api.delete(`documents/${documentId}`);
    }
  }
  const DocumentService = new _DocumentService();

  /**
   * CnabsService
   */
  class _CnabService {
    constructor() {
      this.api = ApiService;
    }

    getCnabs() {
      return this.api.get(`cnabs`);
    }

    destroyCnab(cnabId) {
      return this.api.delete(`cnabs/${cnabId}`);
    }
  }
  const CnabService = new _CnabService();

  /**
   * 
   */
  class _AuthService {

    constructor() {
      this.api = ApiService;
    }

    signIn(email, password) {
      return this.api
        .post('auth/sign_in', { email, password })
    }

    signUp(email, password) {
      return this.api
        .post('auth', { email, password })
    }

    signOut() {
      return this.api
        .delete('auth/sign_out')
    }

    validateToken() {
      return this.api
        .get('auth/validate_token')
    }
  }
  const AuthService = new _AuthService();

  /**
   * Components
   */
  /**
   * Abstract
   */
  class AppComponent extends HTMLElement {
    
    constructor() {
      super();

      this.subscriptions = [];
    }

    disconnectedCallback() {
      this.subscriptions.map(subscription => subscription.unsubscribe());
    }
  }


  class HomePage extends AppComponent {

    get documentsButton() { return this.querySelector("#documents"); }
    get refreshButton() { return this.querySelector("#refresh"); }
    get uploadButton() { return this.querySelector("#upload"); }
    get signOutButton() { return this.querySelector("#sign-out"); }

    constructor() {
      super();

      this.nav = NavController;
      this.documentService = DocumentService;
      this.authService = AuthService;
      this.storage = StorageService;
      this.onMessage$ = onMessage$;

      this.currentUser = this.storage.getItem('user');

      this.authService.validateToken()
        .then(async (response) => {
          if (!response.ok) {
            this.storage.setItem('auth', null);
            this.storage.setItem('user', null);

            return await setRoot();
          }
        });
    }

    connectedCallback() {
      this.innerHTML = `
        <ion-header translucent>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/"></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="end">
              <ion-button color="medium">${this.currentUser?.email || ''}</ion-button>
              <ion-button id="documents">
                <ion-icon name="folder-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button id="refresh">
                <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button id="upload">
                <ion-icon name="cloud-upload-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button id="sign-out" color="danger">
                <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
            <ion-title>Bem-vindo</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen color="light" class="ion-padding">
          <app-cnabs></app-cnabs>
        </ion-content>
      `;

      this.subscriptions.push(
        fromEvent(this.documentsButton, 'click')
          .pipe(
            switchMap((evt) => from(this.openDocuments(evt)))
          )
          .subscribe(),

        fromEvent(this.refreshButton, 'click')
          .subscribe(() => this.onMessage$.next()),

        fromEvent(this.uploadButton, 'click')
          .pipe(
            tap(() => this.uploadButton.setAttribute('disabled', true)),
            switchMap(() => from(this.doUpload()))
          )
          .subscribe(),

        fromEvent(this.signOutButton, 'click')
          .pipe(
            tap(() => this.signOutButton.setAttribute('disabled', true)),
            switchMap(() => from(this.doLogout()))
          )
          .subscribe()
      )
    }

    openDocuments(evt) {
      return presentPopover(evt, 'app-documents');
    }

    async doUpload() {
      const formElement = document.createElement('form');
      formElement.name = "document";
      formElement.enctype = "multipart/form-data";

      const inputElement = document.createElement('input');
      inputElement.name = "file";
      inputElement.type = "file";
      inputElement.accept = "text/plain";

      inputElement.addEventListener('change', () => {
        const formData = new FormData(formElement);

        this.documentService.createDocument(formData)
          .then((response) => {
            
            if (response.ok) {
              this.onMessage$.next();
            }

            formElement.remove();
            this.uploadButton.removeAttribute('disabled');
          });
      });

      formElement.appendChild(inputElement);
      document.body.appendChild(formElement);
      inputElement.click();
    }

    async doLogout() {
      const loading = await presentLoading();

      return this.authService.signOut()
        .then(async (response) => {
          if (response.ok) {
            this.storage.setItem('auth', null);
            this.storage.setItem('user', null);

            loading.dismiss();
            this.signOutButton.removeAttribute('disabled');
            await setRoot();
          }
        });
    }
  }

  class LoginPage extends AppComponent {

    constructor() {
      super();

      this.authService = AuthService;
      this.nav = NavController;
      this.storage = StorageService;

      this.email = undefined;
      this.password = undefined;
    }

    connectedCallback() {
      this.innerHTML = `
        <ion-header translucent class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/"></ion-back-button>
            </ion-buttons>
            <ion-title>Autenticar</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">
          <ion-card style="box-shadow: none!important;">  
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-label position="floating">E-mail</ion-label>
                  <ion-input id="email" type="email"></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="floating">Password</ion-label>
                  <ion-input id="password" type="password"></ion-input>
                </ion-item>        
              </ion-list>
            </ion-card-content>
            <div class="ion-padding">
              <ion-button id="sign-in" size="large">Autenticar</ion-button>
              <ion-button id="sign-up" fill="clear">Criar conta</ion-button>
            <div>
          <ion-card>
        </ion-content>
      `;

      this.subscriptions.push(
        fromEvent(this.querySelector("#email"), 'input')
          .pipe(
            map(event => event.target.value),
            filter(value => value.length > 0),
            distinctUntilChanged(),
            tap(value => this.email = value)
          )
          .subscribe(),

        fromEvent(this.querySelector("#password"), 'input')
          .pipe(
            map(event => event.target.value),
            filter(value => value.length > 0),
            distinctUntilChanged(),
            tap(value => this.password = value)
          )
          .subscribe(),

        fromEvent(this.querySelector("#sign-up"), 'click')
          .subscribe(() => {
            const { email } = this;
            this.nav.push('app-sign-up', { email })
          }),

        fromEvent(this.querySelector("#sign-in"), 'click')
            .pipe(
              switchMap(_ => from(this.doLogin()))
            )
            .subscribe()
      )
    }

    doLogin() {
      return this.authService.signIn(this.email, this.password)
        .then(async (response) => {
          const { headers, ok } = response;
          const { errors, data } = await response.json();

          if (ok) {
            this.storage.setItem('auth', {
              "access-token": headers.get('access-token'),
              "client": headers.get('client'),
              "token-type": headers.get('token-type'),
              "expiry": headers.get('expiry'),
              "uid": headers.get('uid')
            });

            this.storage.setItem('user', data);
            return await setRoot();
          }

          presentToast({
            message: `${[...[ errors ]].join(', ')}`,
            duration: 2000,
            buttons: [
              { icon: 'close', color: 'danger' }
            ]
          });
        });
    }
  }

  class SignUpPage extends AppComponent {

    constructor() {
      super();

      this.authService = AuthService;
      this.storage = StorageService;
      this.nav = NavController;

      this.email = undefined;
      this.password = undefined;
    }

    connectedCallback() {
      this.innerHTML = `
        <ion-header translucent class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/"></ion-back-button>
            </ion-buttons>
            <ion-title>Criar Conta</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">
          <ion-card style="box-shadow: none!important">
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-label position="floating">E-mail</ion-label>
                  <ion-input id="email" type="email"></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="floating">Password</ion-label>
                  <ion-input id="password" type="password"></ion-input>
                </ion-item>        
              </ion-list>
            </ion-card-content>
            <div class="ion-padding">
              <ion-button id="sign-up" size="large">Cadastrar</ion-button>
            </div>
          </ion-card>
        </ion-content>
      `;

      this.subscriptions.push(
        fromEvent(this.querySelector("#email"), 'input')
          .pipe(
            map(event => event.target.value),
            filter(value => value.length > 0),
            distinctUntilChanged(),
            tap(value => this.email = value)
          )
          .subscribe(),

        fromEvent(this.querySelector("#password"), 'input')
          .pipe(
            map(event => event.target.value),
            filter(value => value.length > 0),
            distinctUntilChanged(),
            tap(value => this.password = value)
          )
          .subscribe(),

        fromEvent(this.querySelector("#sign-up"), 'click')
            .pipe(
              switchMap(_ => from(this.doRegister()))
            )
            .subscribe()
      )
    }

    doRegister() {
      return this.authService.signUp(this.email, this.password)
        .then(async (response) => {
          const { headers, ok } = response;
          const { errors, data } = await response.json();

          if (ok) {
            this.storage.setItem('auth', {
              "access-token": headers.get('access-token'),
              "client": headers.get('client'),
              "token-type": headers.get('token-type'),
              "expiry": headers.get('expiry'),
              "uid": headers.get('uid')
            });

            this.storage.setItem('user', data);
            return await setRoot();
          }

          presentToast({
            message: `${[...[ errors ]].join(', ')}`,
            duration: 2000,
            buttons: [
              { icon: 'close', color: 'danger' }
            ]
          });
        })
    }
  }

  class DocumentsComponent extends AppComponent {
    
    get listElement() { return this.querySelector("ion-list"); }

    constructor() {
      super();

      this.documentService = DocumentService;

      this.documentList$ = new Subject();
      this.documentList = this.documentList$.asObservable();

      this.onMessage$ = onMessage$;

      this.documentList.subscribe((documents) => {
        const listContent = this.listElement.querySelector('content');
        listContent.innerHTML = "";

        listContent.innerHTML += `
            ${documents.map(document => `
            <ion-item>
              <ion-label>${document.name}</ion-label>
              <ion-button class="destroy" color="danger" data-id="${document.id}" fill="clear" slot="end">
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>
          `).join('')}
        `;

        const destroyButtons = this.listElement.querySelectorAll(".destroy");
        Array.from(destroyButtons).map((button) => this._bindEvents(button))
      });
    }

    connectedCallback() {
      this.innerHTML = `
        <ion-list>
          <ion-list-header>
            <ion-label>Meus documentos</ion-label>
          </ion-list-header>
          <content></content>
        </ion-list>
      `;

      this.getDocuments();
    }

    async getDocuments() {
      return this.documentService.getDocuments()
        .then(async (response) => {
          if (response.ok) {
            const { data } = await response.json();
            this.documentList$.next(data);
          }
        });
    }

    _bindEvents(button) {
      const { id: documentId }= button.dataset;

      const subscription = fromEvent(button, 'click')
        .pipe(
          switchMap(() => {
            const confirmAction = presentAlert({
              header: "Confirmar ação",
              message: `Remover este documento e todas as movimentações nele registradas?`,
              buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                  text: 'Sim, excluir',
                  handler: async() => {
                    const response = await this.documentService.destroyDocument(documentId);
                    if (response.ok) {
                      presentToast({
                        message: 'Documento excluído com succeso!',
                        duration: 2000,
                        buttons: [
                          { icon: 'checkmark', color: 'success' }
                        ]
                      });
                      this.onMessage$.next();
                    }

                    document.querySelector('ion-popover').dismiss();
                  }
                }
              ]
            });

            return confirmAction.present();
          })
        ).subscribe();

      this.subscriptions.push(subscription);
    }
  }

  class CnabsComponent extends AppComponent {

    get listElement() { return this.querySelector("ion-list"); }

    constructor() {
      super();

      this.cnabService = CnabService;
      this.onMessage = onMessage;

      this.cnabList$ = new Subject();
      this.cnabList = this.cnabList$.asObservable();
      this.cachedList = [];

      this.onMessage.subscribe(() => this.getCnabs())

      this.cnabList.subscribe((cnabs) => {
        this.listElement.innerHTML = "";

        Object.entries(cnabs)
          .map(([company, cnabs]) => {

            const total = cnabs.map(({ value }) => value).reduce((a, c) => a + c, 0);
            const totalElement = `
              <ion-button fill="clear" color="${total < 0 ? 'danger' : 'success'}" 
                size="large" slot="end">
                <ion-icon name="${total < 0 ? 'trending-down-outline' : 'trending-up-outline'}" slot="start"></ion-icon>
                ${total}
              </ion-button>
            `;

            this.listElement.innerHTML += `
              <ion-list-header class="sticky">
                <ion-label>
                  <h1><b>${company}</b></h1>
                </ion-label>
                <div class="ion-float-right ion-margin-horizontal">${totalElement}</div>
              </ion-list-header>
              ${cnabs.map(cnab => `
                <ion-item-sliding>
                  <ion-item-options side="start">
                    <ion-item-option class="destroy" data-id="${cnab.id}" color="danger">
                      Deletar
                    </ion-item-option>
                  </ion-item-options>
                  <ion-item>
                    <ion-label>
                      <h2>${cnab.code} - ${cnab.type}</h2>
                      <p>${cnab.owner} - ${cnab.cpf} - ${cnab.credit_card}</p>
                    </ion-label>
                    <ion-button fill="clear" color="${cnab.incoming ? 'success': 'danger'}" size="large" slot="end">
                      <ion-icon slot="start"
                        name="${cnab.incoming ? 'arrow-up-outline': 'arrow-down-outline'}"></ion-icon>
                        ${cnab.value}
                    </ion-button>
                  </ion-item>
                </ion-item-sliding>
              `).join('')}
              <ion-item>
                <ion-label>
                  <h1>Total</h1>
                </ion-label>
                ${totalElement}
              </ion-item>
              <ion-item-divider color="light"></ion-item-divider>
            `;
          });

        const destroyButtons = this.listElement.querySelectorAll(".destroy");
        Array.from(destroyButtons).map((button) => this._bindEvents(button))
      })
    }

    connectedCallback() {
      this.innerHTML = `
        <ion-list class="ion-no-padding"></ion-list>
      `;

      this.getCnabs();
    }

    async getCnabs() {
      const loading = await presentLoading();

      return this.cnabService.getCnabs()
        .then(async (response) => {
          if (response.ok) {
            const { data } = await response.json();
            this.cachedList = data;
            this.cnabList$.next(groupBy(data, "company"));
          }

          loading.dismiss();
        })
    }

    _bindEvents(button) {
      const { id: cnabId }= button.dataset;

      const subscription = fromEvent(button, 'click')
        .pipe(
          switchMap(() => {
            const confirmAction = presentAlert({
              header: "Confirmar ação",
              message: `Remover este registro?`,
              buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                  text: 'Sim, excluir',
                  handler: async() => {
                    const response = await this.cnabService.destroyCnab(cnabId);
                    if (response.ok) {
                      presentToast({
                        message: 'Registro excluído com succeso!',
                        duration: 2000,
                        buttons: [
                          { icon: 'checkmark', cssClass: 'ion-color-success' }
                        ]
                      });
                      this.getCnabs();
                    }
                  }
                }
              ]
            });

            return confirmAction.present();
          })
        ).subscribe();

      this.subscriptions.push(subscription);
    }
  }

  customElements.define('app-home', HomePage);
  customElements.define('app-login', LoginPage);
  customElements.define('app-sign-up', SignUpPage);
  customElements.define('app-documents', DocumentsComponent);
  customElements.define('app-cnabs', CnabsComponent);

  /**
   * Helpers
   */
  async function presentToast(options) {
    const toast = Object.assign(document.createElement('ion-toast'), options || {});
  
    document.body.appendChild(toast);
    return toast.present();
  }

  async function presentLoading() {
    const loading = document.createElement('ion-loading');
  
    loading.cssClass = 'my-custom-class';
    loading.message = 'Carregando...';
  
    document.body.appendChild(loading);
    await loading.present();

    return loading;
  }

  function presentPopover(ev, component) {
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: component,
      event: ev,
      translucent: true
    });
    document.body.appendChild(popover);
    return popover.present();
  }

  function presentAlert(options) {
    const alert = Object.assign(document.createElement('ion-alert'), options || {});
    
    document.body.appendChild(alert);
    return alert;
  }

  function groupBy(xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  /**
   * Main
   */
  async function setRoot () {
    await sleep(1000);

    if (StorageService.getItem('auth')) {
      NavController.setRoot('app-home');
    } else {
      NavController.setRoot('app-login');
    }
  }

  setRoot();
})