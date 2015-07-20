# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = '2'

Vagrant.require_version '>= 1.5.0'

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.define "carli" do |carli|
    carli.vm.hostname = 'carli'

    # vagrant plugin install vagrant-omnibus
    if Vagrant.has_plugin?("vagrant-omnibus")
      carli.omnibus.chef_version = 'latest'
    end

    carli.vm.box = 'chef/ubuntu-14.04'
    carli.vm.network :private_network, type: 'dhcp'

    # vagrant plugin install vagrant-berkshelf
    if Vagrant.has_plugin?("vagrant-berkshelf")
      carli.berkshelf.berksfile_path = "./chef/cookbooks/carli-select/Berksfile"
      carli.berkshelf.enabled = true
      # carli.berkshelf.only = []
      # carli.berkshelf.except = []
    else
      raise "Please install the Vagrant berkself plugin:\n\tvagrant plugin install vagrant-berkshelf"
    end

    carli.vm.provision :chef_solo do |chef|
      chef.json = {}

      chef.run_list = [ 'recipe[carli-select::default]' ]
    end
  end
end
