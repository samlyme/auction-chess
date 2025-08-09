curl --request POST \
  --url http://localhost:8000/users/ \
  --header 'content-type: application/json' \
  --data '{
  "username": "a",
  "password": "asdf"
}'
curl --request POST \
  --url http://localhost:8000/users/ \
  --header 'content-type: application/json' \
  --data '{
  "username": "b",
  "password": "asdf"
}'
curl --request POST \
  --url http://localhost:8000/users/ \
  --header 'content-type: application/json' \
  --data '{
  "username": "c",
  "password": "asdf"
}'