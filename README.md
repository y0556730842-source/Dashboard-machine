
## Dashboard machine by Yutti Nusbiom

In this project, we're building an application to manage machines in a factory or similar environment. The app will allow users to add, update, and delete machines, displaying their status, name, and last updated time. We'll create a responsive UI using React and Tailwind CSS to ensure an optimal user experience.


---

### **Project Hierarchy**

This is an optional folder structure for the project, which organizes the components, configurations, and Kubernetes files.

```
/project-root
│
├── /src                      
│   ├── /components            
│   ├── /hooks               
│   ├── /types                
│   │   └── Machine.ts
|   ├── /enums
│   │   └── MachineStatus.ts
|   ├──/data
|   │   └── seedMachines.ts
|   ├──/config
|   │   └── env.ts
│   ├── App.tsx               
│   ├── index.tsx             
│   └── /assets           
│
├── /public                    
│   └── index.html            
│
├── /k8s                      
│   ├── /deployment.yaml        
│   ├── /service.yaml          
│   ├── /configmap.yaml       
│   ├── /ingress.yaml         
│   └── /kustomization.yaml   
│
├── .gitignore                
├── Dockerfile                 
├── package.json              
├── package-lock.json         
└── README.md                  
```

---

## Step 1: Defining the Machine Data Structure

The first step is defining a strongly typed data structure that represents a factory machine.

```tsx
// src/types/Machine.ts
import { MachineStatus } from '../enums/MachineStatus';

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  lastUpdated: Date;
}
```

### Explanation

* **Machine** defines the shape of a machine entity used across the application.
* **id** is a unique identifier.
* **name** is required and validated.
* **status** is enforced using a TypeScript enum.
* **lastUpdated** records the last modification timestamp.

---

## Step 2: Creating an Enum for Machine Status

To ensure type safety and prevent invalid values, machine status is modeled as a TypeScript enum.

```tsx
// src/enums/MachineStatus.ts
export enum MachineStatus {
  Idle = 'Idle',
  Running = 'Running',
  Offline = 'Offline',
}
```

### Explanation

Using an enum guarantees that only valid machine states can be assigned and checked at compile time.

---

## Step 3: Building UI Components

This step covers all UI components required for CRUD operations.

---

### Adding a New Machine

```tsx
// src/components/AddMachineForm.tsx
import { useState } from 'react';
import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';

interface Props {
  onAdd: (machine: Machine) => void;
}

const AddMachineForm = ({ onAdd }: Props) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<MachineStatus>(MachineStatus.Idle);

  const submit = () => {
    if (name.trim().length < 2) return;

    onAdd({
      id: crypto.randomUUID(),
      name,
      status,
      lastUpdated: new Date(),
    });

    setName('');
    setStatus(MachineStatus.Idle);
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        className="border p-2 flex-1"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <select
        className="border p-2"
        value={status}
        onChange={e => setStatus(e.target.value as MachineStatus)}
      >
        {Object.values(MachineStatus).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button className="bg-blue-600 text-white px-4" onClick={submit}>
        Add
      </button>
    </div>
  );
};

export default AddMachineForm;
```

### Explanation

This form validates input, creates a new machine object, and delegates persistence to the parent component.

---

### Editing an Existing Machine

```tsx
// src/components/EditMachineForm.tsx
import { useState } from 'react';
import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';

interface Props {
  machine: Machine;
  onSave: (machine: Machine) => void;
  onCancel: () => void;
}

const EditMachineForm = ({ machine, onSave, onCancel }: Props) => {
  const [name, setName] = useState(machine.name);
  const [status, setStatus] = useState(machine.status);

  const save = () => {
    if (name.trim().length < 2) return;
    onSave({ ...machine, name, status, lastUpdated: new Date() });
  };

  return (
    <div className="space-y-2">
      <input
        className="border p-2 w-full"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <select
        className="border p-2 w-full"
        value={status}
        onChange={e => setStatus(e.target.value as MachineStatus)}
      >
        {Object.values(MachineStatus).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button className="bg-green-600 text-white px-3" onClick={save}>
          Save
        </button>
        <button className="bg-gray-400 px-3" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditMachineForm;
```

---

### Displaying a Machine (Card UI)

```tsx
// src/components/MachineCard.tsx
import { useState } from 'react';
import { Machine } from '../types/Machine';
import EditMachineForm from './EditMachineForm';

interface Props {
  machine: Machine;
  onDelete: (id: string) => void;
  onUpdate: (machine: Machine) => void;
}

const MachineCard = ({ machine, onDelete, onUpdate }: Props) => {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border p-4 rounded shadow">
      {editing ? (
        <EditMachineForm
          machine={machine}
          onSave={m => { onUpdate(m); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <h2 className="font-bold">{machine.name}</h2>
          <p>{machine.status}</p>
          <p className="text-sm">
            {machine.lastUpdated.toLocaleString()}
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(machine.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

export default MachineCard;
```

---

## Step 4: State Management, Persistence, and Undo

---

### Persisting Data with localStorage

```tsx
// src/hooks/useLocalStorage.ts
import { useEffect, useState } from 'react';

const dateReviver = (_key: string, value: unknown) => {
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  seed?: T
) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);

    if (stored) {
      return JSON.parse(stored, dateReviver);
    }

    if (seed !== undefined) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }

    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

---

### Seed Data (First Load)

```tsx
// src/data/seedMachines.ts
import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';

const now = new Date();

export const seedMachines: Machine[] = [
  {
    id: crypto.randomUUID(),
    name: 'Cutter A',
    status: MachineStatus.Running,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Press B',
    status: MachineStatus.Idle,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Welder C',
    status: MachineStatus.Offline,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Lathe D',
    status: MachineStatus.Running,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Drill E',
    status: MachineStatus.Idle,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Robot F',
    status: MachineStatus.Running,
    lastUpdated: now,
  },
];
```

---

### Updated `useMachines` Hook

```tsx
// src/hooks/useMachines.ts
import { useEffect, useState } from 'react';
import { Machine } from '../types/Machine';
import { useLocalStorage } from './useLocalStorage';
import { seedMachines } from '../data/seedMachines';

export const useMachines = () => {
  const [machines, setMachines] =
  useLocalStorage<Machine[]>(
    'machines',
    [],
    seedMachines
  );

  const [lastDeleted, setLastDeleted] = useState<{
  machine: Machine;
  index: number;
  } | null>(null);

  const addMachine = (machine: Machine) =>
    setMachines([...machines, machine]);

  const updateMachine = (updated: Machine) =>
    setMachines(
      machines.map(m =>
        m.id === updated.id ? updated : m
      )
    );

  const deleteMachine = (id: string) => {
    setMachines(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;

      setLastDeleted({
        machine: prev[index],
        index,
      });

      return prev.filter(m => m.id !== id);
    });
  };

  const undoDelete = () => {
    if (!lastDeleted) return;

    setMachines(prev => {
      const next = [...prev];
      next.splice(lastDeleted.index, 0, lastDeleted.machine);
      return next;
    });

    setLastDeleted(null);
  };

  return {
    machines,
    addMachine,
    updateMachine,
    deleteMachine,
    undoDelete,
    lastDeleted,
  };
};
```

---

## Step 5: Filtering Machines by Status

```tsx
// src/components/StatusFilter.tsx
import { MachineStatus } from '../enums/MachineStatus';

type StatusFilterValue = MachineStatus | 'ALL';

interface Props {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

const StatusFilter = ({ value, onChange }: Props) => (
  <select
    className="border p-2 mb-4"
    value={value}
    onChange={(e) => {
      const val = e.target.value;
      if (val === 'ALL') {
        onChange('ALL');
      } else {
        onChange(val as MachineStatus);
      }
    }}
  >
    <option value="ALL">All</option>
    {Object.values(MachineStatus).map(status => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
);

```

---

## Step 6: Machine List Layout + Undo UI

```tsx
{lastDeleted && (
  <div className="bg-yellow-100 p-2 mb-4 flex justify-between">
    <span>Machine deleted</span>
    <button className="underline" onClick={undoDelete}>
      Undo
    </button>
  </div>
)}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredMachines.map(machine => (
    <MachineCard
      key={machine.id}
      machine={machine}
      onDelete={deleteMachine}
      onUpdate={updateMachine}
    />
  ))}
</div>
```

---
## Step 7: Runtime Configuration for React Using Kubernetes ConfigMap

Since React is built as a static application, environment variables injected by Kubernetes
are not directly accessible at runtime. React only reads environment variables during build time.

To allow dynamic configuration without rebuilding the application, a runtime configuration
mechanism is used.

The application loads a generated `env.js` file at startup, which exposes Kubernetes-provided
environment variables through a global object (`window.__ENV__`). This file is generated when
the container starts, using values injected from a Kubernetes ConfigMap.

This approach enables:
- Environment-specific configuration
- No rebuilds when configuration changes
- Full compatibility with Kubernetes best practices

The Docker image is responsible for generating the runtime configuration file,
while Kubernetes provides the configuration values via ConfigMaps.

1. Kubernetes injects environment variables into the container.
2. The container startup script writes those values into `env.js`.
3. The browser loads `env.js` before the React app.
4. React reads configuration from `window.__ENV__`.

This enables:

* Runtime configuration
* Environment-specific values
* Full Kubernetes compatibility
* No rebuilds per environment

---

## Step 1 — Define Runtime Configuration File

### `public/env.js`

```js
window.__ENV__ = {
  APP_TITLE: "__APP_TITLE__"
};
```

This file acts as a placeholder.
The value will be replaced at container startup.

---

### Load `env.js` in `index.html`

```html
<!-- public/index.html -->
<script src="%PUBLIC_URL%/env.js"></script>
```

This ensures the configuration is available **before React renders**.

---

## Step 2 — Inject ConfigMap Value at Container Startup

### Dockerfile (Nginx stage)

```dockerfile
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

CMD ["/bin/sh", "-c", "sed -i \"s|__APP_TITLE__|$APP_TITLE|g\" /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"]
```

### Explanation

* Kubernetes injects `APP_TITLE` as an environment variable.
* `sed` replaces the placeholder in `env.js`.
* Nginx serves the static app normally.

No rebuild is required when `APP_TITLE` changes.

---

## Step 3 — Provide APP_TITLE from Kubernetes ConfigMap

### `configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  appTitle: "Machine Dashboard"
```

---

### Deployment Environment Variable

```yaml
env:
  - name: APP_TITLE
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: appTitle
```

---

## Step 4 — Consume Runtime Configuration in React

### Runtime Config Helper

```ts
// src/config/env.ts
declare global {
  interface Window {
    __ENV__?: {
      APP_TITLE?: string;
    };
  }
}

export const APP_TITLE =
  window.__ENV__?.APP_TITLE ?? 'Machine Dashboard';
```

This file provides:

* Type safety
* Fallback value
* Centralized access to runtime configuration

---

### Display the Value in the UI

```tsx
// src/App.tsx
import { APP_TITLE } from './config/env';

function App() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {APP_TITLE}
      </h1>

      {/* rest of the application */}
    </div>
  );
}

export default App;
```

---

## Result

* `APP_TITLE` is defined in a Kubernetes ConfigMap
* Injected into the container at runtime
* Loaded dynamically by the browser
* Displayed by the React application



---


### **1. Dockerfile for Building the React App Image**

 A Dockerfile to build the React app into a production-ready image. This image will be deployed on Kubernetes.

```dockerfile
FROM node:16 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### **Explanation of Dockerfile:**

* **Step 1 (Build):**

* Using `node:16` to install the required dependencies and build the React app.
* After building the app, the built files are stored in the `/app/build` directory.

* **Stage 2 (Nginx to serve the build):**

  * The built React app is copied to an Nginx container (`nginx:alpine`) which will serve the app.
  * The container will expose port 80 to serve the web application.

---

Once the Dockerfile is ready, you can build and either push the Docker image to a container registry like Docker Hub or store it in a private Docker registry for internal use:

```bash
docker build -t my-react-app .
docker push my-react-app 

docker build -t your-registry.com/my-project/my-react-app .
docker push your-registry.com/my-project/my-react-app
```

### **2. Kubernetes Deployment Manifest (`deployment.yaml`)**

The **Deployment** is a Kubernetes resource used to define the pods (containers) running our application. The deployment ensures that the app has the desired number of replicas, and that if anything goes wrong, Kubernetes will restart the container.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-app-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: react-app
  template:
    metadata:
      labels:
        app: react-app
    spec:
      containers:
      - name: react-app
        image: my-react-app:latest
        ports:
        - containerPort: 80
        env:
        - name: APP_TITLE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: appTitle
```

### **Explanation of the Deployment Manifest:**

* **replicas:** Defines that there will be two instances (pods) of the app running.
* **selector:** Ensures that the Deployment manages pods with the label `app: react-app`.
* **template:** Describes the pod's specification.

  * The container image (`my-react-app:latest`) is used to run the app.
  * The `APP_TITLE` environment variable is pulled from a **ConfigMap** (explained below).

---

### **3. Kubernetes Service Manifest (`service.yaml`)**

The **Service** resource exposes the application to external access. The **NodePort** service is used to make the application available through a specific port on the cluster nodes.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: react-app-service
spec:
  selector:
    app: react-app
  ports:
    - protocol: TCP
      port: 80       
      targetPort: 80 
      nodePort: 30000 
  type: NodePort
```

### **Explanation of the Service Manifest:**

* **selector:** This matches the `app: react-app` label, which ensures the service routes traffic to the correct pods.
* **ports:**

  * `port`: The port that the service will expose to the cluster.
  * `targetPort`: The internal port of the container (where the React app listens).
  * `nodePort`: The external port on the node that can be accessed to reach the app.
* **type: NodePort:** Exposes the app externally on a specific port on each Kubernetes node.

---

### **4. Kubernetes ConfigMap Manifest (`configmap.yaml`)**

**ConfigMap** stores configuration data that the application can use. In this case, the application name is stored in the ConfigMap and passed to the application as an environment variable.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  appTitle: "Machine Dashboard"
```

### **Explanation of the ConfigMap Manifest:**

* **data:** Contains configuration data. In this case, the app's title (`appTitle`), which will be injected into the React app.

---

### **5. Accessing the App**

After deploying to Kubernetes, can access it by visiting the external IP of any of the cluster nodes, followed by the `nodePort`:

1. Find the external IP of your node:

   ```bash
   kubectl get nodes -o wide
   ```

2. Access the app through the `nodePort` (e.g., `http://<NODE_IP>:30000`).

---

### **6. Using Kustomize (Optional)**

Kustomize is a tool that helps manage Kubernetes manifests. It allows to create reusable configurations and customize them for different environments (e.g., production, development).

#### **Base Configuration (base/)**

In the `base/` directory, define the common resources that are shared across environments.

```plaintext
/k8s
  /base
    deployment.yaml
    service.yaml
    configmap.yaml
```

#### **Overlay Configuration (overlays/)**

In the `overlays/` directory, you can define environment-specific customizations, such as different configuration values or replica counts.

```plaintext
/k8s
  /overlays
    /prod
      deployment.yaml
      service.yaml
      configmap.yaml
```

#### **kustomization.yaml** (Base)

```yaml
# k8s/base/kustomization.yaml
resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml
```

#### **kustomization.yaml** (Overlay)

```yaml
# k8s/overlays/prod/kustomization.yaml
bases:
  - ../../base
namespace: prod
```

### **7. Deployment Commands**

1. Apply the Kubernetes manifests to the cluster:

   ```bash
   kubectl apply -k ./k8s/overlays/prod
   ```

   If not using Kustomize:

   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   kubectl apply -f configmap.yaml
   ```

2. Once the deployment is successful, find the external IP of your Kubernetes node and access the app using the `nodePort`.

---

### Optional

#### **Organize Manifests Using Kustomize**

Kustomize is a tool designed to manage Kubernetes configurations efficiently by allowing customization without changing the original files. With Kustomize, you can define a **base** configuration and create multiple **overlays** to manage different environments (e.g., development, staging, production). This approach avoids code duplication and makes it easy to maintain and scale configurations.

To implement Kustomize:

* **Base Configuration**: This contains the common setup that will be shared across all environments. This might include the main `deployment`, `service`, `ingress`, or other Kubernetes resources.
* **Overlays**: These are environment-specific configurations that can override parts of the base configuration. For example, an overlay might change the image version or update resource limits for a production environment.

The structure could look like this:

1. In the `base/` directory, the standard manifests (e.g., deployment and service configurations) are stored.
2. For each environment, an overlay directory is created (e.g., `overlays/dev/`, `overlays/prod/`), where environment-specific changes are defined in a `kustomization.yaml` file.
3. The overlays can be applied using the `kubectl apply -k` command, followed by the path to the overlay directory.


---

### Documentation (README)

#### **How to Run the App Locally (Development)**


**Example:**

```bash
# Clone the repository
git clone https://github.com/your-repo.git
cd your-repo

# Install dependencies
npm install

# Start the application
npm start
```

#### **How to Build the Production Version**

**Example:**

```bash
npm run build

```

#### **How to Deploy to Kubernetes Using `kubectl apply`**

To deploy the application to Kubernetes, need to apply the manifests (either using a base or overlay configuration). This step assumes  have a running Kubernetes cluster and access to the `kubectl` tool.

**Example:**

```bash
kubectl apply -k overlays/prod/

kubectl apply -k overlays/dev/
```

#### **How to Access the App in the Browser**

Once the app is deployed, it should be accessible via a browser. Depending on the Kubernetes setup, this could be through an **Ingress** or **LoadBalancer**. Ingress resources are usually configured to route traffic from a specific domain (e.g., `app.example.com`) to the service. A LoadBalancer, on the other hand, exposes the service to the public internet and provides an external IP address.

**Example:**

* If using **Ingress**, the URL to access the application might be something like `http://myapp.example.com`.
* If using **LoadBalancer**, Kubernetes will assign an external IP address to the service that they can use to access the application.


#### **What You Would Improve or Add with More Time**

* **CI/CD Integration**: Automate the build, test, and deployment processes using tools like GitHub Actions.
* **Better Environment Management**: Create separate environments for development, staging, and production to streamline deployment.
* **User Authentication**: Implement a simple login system to restrict access to authorized users only.
* **Error Handling**: Add proper error messages and handling to improve the user experience in case of failures.
* **Unit testing**: Add unit testing to improve the quality of the project.

---
