docker run  \
  -p 4000:80 \
  --env-file ./env/prod/.env \
  --name xwdrblue/match_recoveries \
  match_recoveries
