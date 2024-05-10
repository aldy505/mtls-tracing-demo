To generate the TLS certificates:

```bash
openssl req -x509 -sha256 -days 30 -nodes -newkey rsa:2048 -keyout rootCA.key -out rootCA.crt

openssl req -newkey rsa:2048 -nodes -keyout alderaan.key -out alderaan.csr

cat <<EOF > domain.ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = alderaan.demo.reinaldyrafli.com
EOF

openssl x509 -req -CA rootCA.crt -sha256 -CAkey rootCA.key -in alderaan.csr -out alderaan.crt -days 7 -CAcreateserial
-extfile domain.ext

rm domain.ext

openssl req -newkey rsa:2048 -nodes -keyout corellia.key -out corellia.csr

cat <<EOF > domain.ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = corellia.demo.reinaldyrafli.com
EOF

openssl x509 -req -CA rootCA.crt -CAkey rootCA.key -in corellia.csr -out corellia.crt -days 7 -CAcreateserial -extfile
domain.ext

rm domain.ext
```

It should generate these files:

```shell
.
├── alderaan.crt
├── alderaan.csr
├── alderaan.key
├── corellia.crt
├── corellia.csr
├── corellia.key
├── rootCA.crt
├── rootCA.key
└── rootCA.srl
```