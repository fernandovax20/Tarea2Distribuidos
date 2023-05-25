# Tarea 2 Distribuidos

Este repositorio contiene la implementación de una comunicación de tipo producer-consumer y la separación en 5 categorías. A continuación, se detallan estas partes.

## Tecnologías Utilizadas
<img src="https://www.docker.com/wp-content/uploads/2022/03/horizontal-logo-monochromatic-white.png" width="300" height="80">
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" width="300" height="80">
<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Apache_kafka_wordtype.svg" width="300" height="80">
<img src="https://cdn.freebiesupply.com/logos/large/2x/rabbitmq-logo-black-and-white.png" width="80" height="80">

## Parte 1: Implementación de Comunicación Producer-Consumer

En esta sección, implementamos un mecanismo de comunicación de tipo producer-consumer. Este mecanismo permite que múltiples productores (producers) generen datos que luego son consumidos por varios consumidores (consumers).
Para esta actividad fue desarrollada bajo 2 herramientas muy populares en este ambito, las cuales son. Apache Kafka y RabbitMQ.

### Cómo funciona

la forma correcta de ejecutar estos es accediendo a la carpeta de cada uno de ellos y ejecutando el comando `docker-compose up` para levantar los contenedores de cada uno de ellos.

### Pruebas

Para realizar las pruebas comparativas de forma grafica, cada uno de estos tienen un volumen el cual genera un txt cuando el sistema esta estable,
Este contiene informacion del uso de cpu actual del sistema. Una vez se obtiene esta carpeta con python se puede separar esta informacion, obtener un promedio y luego asignarlo como sifra dependiendo
de cuantos mensaje envia cada uno de los producers. En definitiva va por cantidad de mensajes enviados vs uso de cpu.

Tambien existe algunos apartados que existen unos if comentados. Esto estan puesto que se hicieron test para ver como se comportaba el sistema cuando se enviaba un mensaje a un consumer contiene un Non-serializable message (referencia circular)
Con la idea de comparar el comportamiento ante este problema entre las 2 herramientas.

## Parte 2: Separación en 5 Categorías

En esta sección, separamos los datos en 5 categorías diferentes, las cuales cada consumer envia informacion sobre temperatura, humedad, luminocidad, ph y co2.

### Categorías

Las categorias que envia cada dispositivo (producer) son las siguientes:

- Temperatura 
- Humedad
- Luminocidad
- Ph
- Co2

EL formato de la data como tal esta en value etipo uuidv4, esto es para poder enviar informacion random a cada uno de los consumers.

### Cómo funciona

la forma correcta de ejecutar estos es accediendo a la carpeta de cada uno de ellos y ejecutando el comando `docker-compose up` para levantar los contenedores de cada uno de ellos.



