require 'net/http'


from = {
  lat: ARGV[0].to_f,
  lon: ARGV[1].to_f
}

to = {
  lat: ARGV[2].to_f,
  lon: ARGV[3].to_f
}

if ARGV[4]
  resolution = ARGV[4].to_i
else
  resolution = 20
end


coords = [];
for x in 0..resolution
  for y in 0..resolution
    coord = {}

    coord[:lat] = from[:lat] + ((to[:lat] - from[:lat])/resolution)*x
    coord[:lon] = from[:lon] + ((to[:lon] - from[:lon])/resolution)*y

    coords[y*20 + x] = coord
  end
end

coordsString = []
coords.each do |coord|
  coordsString << coord[:lat].to_s + "," + coord[:lon].to_s
end


splitedCoords = coordsString.each_slice(10).to_a
splitedJoinCoords = []
splitedCoords.each do |splitedCoord|
  splitedJoinCoords << splitedCoord.join("|")
end





# todo :
# - format request
# - send request & manage result




uri = URI('https://api.open-elevation.com/api/v1/lookup')
responses = []
splitedJoinCoords.each_with_index do |param, index|

  paramsFormated = { :locations => param }
  uri.query = URI.encode_www_form(paramsFormated)
  rank = index

  Net::HTTP.start(uri.host, uri.port, :use_ssl => true ) do |http|
    request = Net::HTTP::Get.new uri
    response = http.request request # Net::HTTPResponse object
    responses << {
      rank: rank,
      response: response.body
    }

    if( responses.length == splitedJoinCoords.length )
  end

end

