export const CollectionName = 'users'
//export const DBServiceURL = "https://kvtreeservice.deno.dev/"
export const DBServiceURL = "http://localhost:9099/"

export const RegistrationURL = DBServiceURL + "RpcRegistration"

const DEV = true
const transactions = new Map();
let nextTxID = 0;

/**
 * This db client communicates with an RPC service.    
 */
export class DbClient {

   nextTxID = 0
   querySet = []
   transactions = new Map()

   /** 
    * initialize our EventSource and fetch some data    
    */
   async init(callBack)  {
      let connectAttemps = 0 
      if (DEV) console.log("CONNECTING");
          
      const eventSource = new EventSource(RegistrationURL);
      
      eventSource.addEventListener("open", () => {
         if (DEV) console.log("CONNECTED");
         this.fetchDataSet(callBack)
      });

      eventSource.addEventListener("error", (_e) => {
         switch (eventSource.readyState) {
            case EventSource.OPEN:
               if (DEV) console.log("CONNECTED");
               break;
            case EventSource.CONNECTING:
               if (DEV) console.log("CONNECTING");
               connectAttemps++
               if (connectAttemps > 1) {
                  eventSource.close()
                  alert(`No Service!
Please start the DBservice!
See: readme.md.`) 
               }
               if (DEV) console.log(`URL: ${globalThis.location.href}`)
               break;
            case EventSource.CLOSED:
               if (DEV) console.log("DISCONNECTED");
               break;
         }
      });

      /* 
      When we get a message from the service we expect 
      an object containing {txID, error, and result}.
      We then find the transaction that was registered for this txID, 
      and execute it with the error and result properities.
      This will resolve or reject the promise that was
      returned to the client when the transaction was created.
      */
      eventSource.addEventListener("message", (evt) => {
         const parsed = JSON.parse(evt.data);
         const { txID, error, result } = parsed;         // unpack
         if (!transactions.has(txID)) return             // check        
         const transaction = transactions.get(txID)      // fetch
         transactions.delete(txID)                       // clean up
         if (transaction) transaction(error, result)     // execute
      })
 
   }

   /**
    * fetch a querySet      
    */
   fetchDataSet(callBack) {
      if (DEV) console.log('fetching')
      Call("GETALL", {})
         .then((result) => callBack(result))
   }

   /** get the value from a key */
   get(key) {
      for (let index = 0; index < this.querySet.length; index++) {
         const element = this.querySet[index];
         if (element.id === key) return element
      }
   }

   /** 
    * Set a value on a key
    * The `set` method mutates - will call the `persist` method. 
    */
   set(key, value) {
      if (DEV) console.log(`set call key = `, key)
      try {
         // persist single record to the service
         Call("SET",
            {
               key: key,
               value: value
            })
            .then((result) => {
               if (DEV) console.info('SET call returned ', result.querySet)
               this.querySet = result.querySet
               return this.querySet
            })
      } catch (e) {
         return { Error: e }
      }
   }

   /** 
    * Deletes a key/value from the KvDb
    * The `delete` method mutates - will call the `persist` method. 
    */
   delete(key) {
      try {
         Call("DELETE", { key: key })
            .then((result) => {
               this.querySet = result.querySet
               this.totalPages = result.totalPages
               return this.querySet
            })
      } catch (_e) {
         return { Error: _e }
      }
   }

} // End class

/** 
 * Make an Asynchronous Remote Proceedure Call
 *  
 * @param {key extends keyof TypedProcedures} procedure - the name of the remote procedure to be called
 * @param {TypedProcedures[key]} params - appropriately typed parameters for this procedure
 * 
 * @returns {Promise} - Promise object has a transaction that is stored by ID    
 *   in a transactions Set.   
 *   When this promise resolves or rejects, the transaction is retrieved by ID    
 *   and executed by the promise. 
 */
export const Call = ( procedure, params ) => {

   const txID = nextTxID++;

   if (DEV) console.log(`RPC txID ${txID} called ${procedure} with ${JSON.stringify(params)}`);

   return new Promise((resolve, reject) => {
      transactions.set(txID, (error, result) => {
         if (error)
            return reject(new Error(error));
         resolve(result);
      });
      fetch(DBServiceURL, {
         method: "POST",
         mode: 'cors',
         body: JSON.stringify({ txID, procedure, params })
      });
   });
};
