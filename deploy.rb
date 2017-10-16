require 'net/scp'
require 'net/ssh'

system("tar -czvf deploy.tar.gz . ")

Net::SCP.upload!(ENV['DEPLOYHOST'], "codeninjauser",
    "deploy.tar.gz", "/home/codeninjauser/deploy.tar.gz",
    :ssh => { :password => ENV['DEPLOYPASSWORD'] })

Net::SSH.start(ENV['DEPLOYHOST'], 'codeninjauser', :password => ENV['DEPLOYPASSWORD']) do |ssh|
    # capture all stderr and stdocdout output from a remote process
    puts("Removing old files")
    puts ssh.exec!("rm -rf containers")
    puts("Making empty folder")
    puts ssh.exec!("mkdir containers")
    puts("Extract zip")
    puts ssh.exec!("tar -xzvf deploy.tar.gz -C /home/codeninjauser/containers")
    puts("Stop old service")
    puts ssh.exec!("cd containers;docker-compose stop")
    puts("Delete other packages")
    puts ssh.exec!("docker rm `docker ps --no-trunc -aq`")
    puts("Build service")
    puts ssh.exec!("cd containers;docker-compose build")
    puts("Start service")
    puts ssh.exec!("cd containers;docker-compose up -d")
end