
NAME=${1%:*}  # retain the part before the colon
NAME=${NAME##*/}  # retain the part after the last slash
jq 'group_by(.id) | map(select(.[0].id != 83)) | map({id: .[0].id, count: length})' $1 > output/itemLocations/$NAME