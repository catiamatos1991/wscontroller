'use strict';

function WavesysController() {
    WavesysController.prototype.setRoutes = function (express) {
        var router = express.Router();

        return router;
    };
}

WavesysController.prototype.parseEthConfigs = function (interfaceIfname, allConfigs) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'parseEthConfigs', 'inicio');
    var ethConfigs = {};
    ethConfigs.network = {};
    ethConfigs.dhcp = {};

    var interfaceName = "";

    if (allConfigs.network_wavesys != undefined) {
        for (var element in allConfigs.network_wavesys) {
            if (allConfigs.network_wavesys[element].ifname != undefined) {
                var arrSplit = [];
                if (typeof allConfigs.network_wavesys[element].ifname == 'object') {
                    arrSplit = allConfigs.network_wavesys[element].ifname;
                } else {
                    arrSplit = allConfigs.network_wavesys[element].ifname.split(" ");
                }

                if (arrSplit.indexOf(interfaceIfname) > -1) {
                    ethConfigs.network = allConfigs.network_wavesys[element];
                    if (ethConfigs.network.type != undefined && ethConfigs.network.type == 'bridge') {
                        ethConfigs.network.enable_bridge = true;
                        ethConfigs.network.bridgename = element;
                        ethConfigs.network.bridge = {};

                        for (var i = 0; i < arrSplit.length; i++) {
                            ethConfigs.network.bridge[arrSplit[i]] = true;
                        }

                        if (allConfigs.wireless_wavesys != undefined) {
                            for (var radioElement in allConfigs.wireless_wavesys) {
                                if (allConfigs.wireless_wavesys[radioElement].network != undefined && allConfigs.wireless_wavesys[radioElement].network == element) {
                                    ethConfigs.network.bridge[allConfigs.wireless_wavesys[radioElement].device] = true;
                                }
                            }
                        }
                    }
                    if (ethConfigs.network.stp != undefined && ethConfigs.network.stp == '1') {
                        ethConfigs.network.enable_stp = true;
                    }
                    if (ethConfigs.network.auto == undefined || ethConfigs.network.auto == '1') {
                        ethConfigs.network.enable_auto = true;
                    }
                    if (ethConfigs.network.defaultroute == undefined || ethConfigs.network.defaultroute == '1') {
                        ethConfigs.network.enable_defaultroute = true;
                    }
                    if (ethConfigs.network.peerdns == undefined || ethConfigs.network.peerdns == '1') {
                        ethConfigs.network.enable_peerdns = true;
                    }
                    interfaceName = element;
                    break;
                }
            }
        }
    }

    if (allConfigs.dhcp_wavesys != undefined) {
        for (var element in allConfigs.dhcp_wavesys) {
            if (allConfigs.dhcp_wavesys[element].interface != undefined && allConfigs.dhcp_wavesys[element].interface == interfaceName) {
                ethConfigs.dhcp = allConfigs.dhcp_wavesys[element];
                if (ethConfigs.dhcp.ignore == undefined || ethConfigs.dhcp.ignore != '1') {
                    ethConfigs.dhcp.enable_dhcp = true;
                }
                if (ethConfigs.dhcp.dynamicdhcp == undefined || ethConfigs.dhcp.dynamicdhcp != '0') {
                    ethConfigs.dhcp.enable_dynamicdhcp = true;
                }
                if (ethConfigs.dhcp.force != undefined || ethConfigs.dhcp.force == '1') {
                    ethConfigs.dhcp.enable_force = true;
                }
                break;
            }
        }
    }

    return ethConfigs;
};

WavesysController.prototype.serializeEthConfigs = function (allConfigs, interfaceData) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'serializeEthConfigs', 'inicio');
    var newConfigs = JSON.parse(JSON.stringify(allConfigs));

    if (newConfigs.network_wavesys != undefined && interfaceData.network != undefined) {
        //guarda nome inicial da interface
        var interfaceName = interfaceData.network['.name'];

        //Testa se a interface definida é do tipo bridge
        if (interfaceData.network.enable_bridge != undefined && interfaceData.network.enable_bridge == true && interfaceData.network.bridge != undefined) {
            //Caso a interface seja do tipo bridge

            //Remove das configurações a interface com o nome inicial     
            delete newConfigs.network_wavesys[interfaceName];
            if (newConfigs.dhcp_wavesys != undefined) {
                delete newConfigs.dhcp_wavesys[interfaceName];
            }
            if (newConfigs.radio_wavesys != undefined) {
                for (var radioElement in newConfigs.radio_wavesys) {
                    if (newConfigs.radio_wavesys[radioElement].network != undefined && newConfigs.radio_wavesys[radioElement].network == interfaceName) {
                        delete newConfigs.radio_wavesys[radioElement].network;
                    }
                }
            }


            //Define o nome da interface com o valor dado ao nome da bridge
            interfaceName = interfaceData.network.bridgename;
            var bridgeIfname = "";

            //Cria a nova interface com o nome da bridge e com as configurações presentes vindas da interface 
            //acrescentando o type bridge e .name com o valor do nome da bridge
            newConfigs.network_wavesys[interfaceName] = interfaceData.network;
            newConfigs.network_wavesys[interfaceName]["type"] = "bridge";
            newConfigs.network_wavesys[interfaceName][".name"] = interfaceData.network.bridgename;

            //Define o valor de ifname da bridge tendo em conta as interfaces a true no array bridge
            for (var element in interfaceData.network.bridge) {
                if (interfaceData.network.bridge[element]) {
                    if (element.substr(0, 5) != 'radio') {
                        bridgeIfname = bridgeIfname + element + " ";
                        //Verificar se existe alguma network configurada para o element e fazer o seu delete
                        for (var networkElement in newConfigs.network_wavesys) {
                            if (networkElement != interfaceName && newConfigs.network_wavesys[networkElement].ifname != undefined && newConfigs.network_wavesys[networkElement].ifname == element) {
                                delete newConfigs.network_wavesys[networkElement];
                                delete newConfigs.dhcp_wavesys[networkElement];
                                break;
                            }
                        }

                    } else {
                        var testInterfaceRadio = false;
                        //Colocar o nome da bridge na network do rádio
                        for (var radioElement in newConfigs.radio_wavesys) {
                            if (newConfigs.radio_wavesys[radioElement].device == element) {
                                testInterfaceRadio = true;
                                //Guardar network anterior do rádio
                                var oldRadioNetwork = newConfigs.radio_wavesys[radioElement].network;
                                newConfigs.radio_wavesys[radioElement].network = interfaceName;

                                //Testar se vale a pena manter antiga network ou deve ser apagada
                                if (newConfigs.network_wavesys[oldRadioNetwork] != undefined && newConfigs.network_wavesys[oldRadioNetwork].type != undefined && newConfigs.network_wavesys[oldRadioNetwork].type == 'bridge') {
                                    var testRadioBridge = false;
                                    for (var radioElement2 in newConfigs.radio_wavesys) {
                                        if (newConfigs.radio_wavesys[radioElement2].network == oldRadioNetwork) {
                                            testRadioBridge = true;
                                            break;
                                        }
                                    }

                                    if (!testRadioBridge && (newConfigs.network_wavesys[oldRadioNetwork].ifname == undefined || newConfigs.network_wavesys[oldRadioNetwork].ifname == '')) {
                                        delete newConfigs.network_wavesys[oldRadioNetwork];
                                        delete newConfigs.dhcp_wavesys[oldRadioNetwork];
                                    }
                                } else {
                                    delete newConfigs.network_wavesys[oldRadioNetwork];
                                    delete newConfigs.dhcp_wavesys[oldRadioNetwork];
                                }

                                break;
                            }
                        }

                        if (!testInterfaceRadio) {
                            //Criar iface para o rádio
                        }
                    }
                }
            }
            newConfigs.network_wavesys[interfaceName].ifname = bridgeIfname.trim();

        } else {
            //Caso a interface não seja do tipo bridge

            //Percorre todos os elementos da configuração de network
            for (var element in newConfigs.network_wavesys) {
                var arrSplit = newConfigs.network_wavesys[element].ifname.split(" ");
                //Testa se no ifname do elemento existe presente o ifname da interface
                if (arrSplit.indexOf(interfaceData.ifname) > -1) {
                    //Caso exista o ifname da interface retira-o do elemento em que se encontra refazendo o ifname desse elemento
                    var newIfname = "";
                    for (var i = 0; i < arrSplit.length; i++) {
                        if (arrSplit[i] != interfaceData.ifname) {
                            newIfname = newIfname + arrSplit[i] + " ";
                        }
                    }
                    newIfname = newIfname.trim();

                    if (newIfname == "") {
                        //Se o ifname final do elemento ficar vazio corre os elementos presentes nas configurações radio para testar se existe algum rádio associado ao elemento em questão
                        var testInterfaceRadio = false;
                        for (var radioElement in newConfigs.radio_wavesys) {
                            if (newConfigs.radio_wavesys[radioElement].network != undefined && newConfigs.radio_wavesys[radioElement].network == element) {
                                testInterfaceRadio = true;
                                delete newConfigs.network_wavesys[element].ifname;
                                break;
                            }
                        }
                        //Caso não exista nenhum elemento associado ao rádio em questão elimina esse elemento das configurações network
                        if (!testInterfaceRadio) {
                            delete newConfigs.network_wavesys[element];
                            delete newConfigs.dhcp_wavesys[element];
                        }
                    } else {
                        //Caso o ifname não fique vazio atribui ao elemento o novo ifname
                        newConfigs.network_wavesys[element].ifname = newIfname;
                    }
                    break;
                }
            }

            //Cria a nova interface
            interfaceName = "wan";
            if (interfaceData.ifname.substr(0, 5) == 'radio') {
                interfaceName = 'wlan' + interfaceData.ifname.substr(5, 1)
            } else if (interfaceData.ifname != 'eth0') {
                interfaceName = "lan";
            }
            newConfigs.network_wavesys[interfaceName] = interfaceData.network;
            newConfigs.network_wavesys[interfaceName][".name"] = interfaceName;
            if (interfaceData.ifname.substr(0, 5) != 'radio') {
                newConfigs.network_wavesys[interfaceName]["ifname"] = interfaceData.ifname;
            } else {
                delete newConfigs.network_wavesys[interfaceName]["ifname"];
            }

            //Remove o type da interface por não ser bridge independentemente do seu valor
            delete newConfigs.network_wavesys[interfaceName].type;
        }

        if (newConfigs.network_wavesys[interfaceName].enable_stp) {
            newConfigs.network_wavesys[interfaceName].stp = '1';
        }
        if (!newConfigs.network_wavesys[interfaceName].enable_auto) {
            newConfigs.network_wavesys[interfaceName].auto = '0';
        } else {
            delete newConfigs.network_wavesys[interfaceName].auto;
        }
        if (newConfigs.network_wavesys[interfaceName].proto == 'dhcp' && !newConfigs.network_wavesys[interfaceName].enable_defaultroute) {
            newConfigs.network_wavesys[interfaceName].defaultroute = '0';
        }
        if (newConfigs.network_wavesys[interfaceName].proto == 'dhcp' && !newConfigs.network_wavesys[interfaceName].enable_peerdns) {
            newConfigs.network_wavesys[interfaceName].peerdns = '0';
        }


        //Remove do elemento as variáveis não referentes a configurações Wavesys
        delete newConfigs.network_wavesys[interfaceName].enable_bridge;
        delete newConfigs.network_wavesys[interfaceName].bridge;
        delete newConfigs.network_wavesys[interfaceName].bridgename;
        delete newConfigs.network_wavesys[interfaceName].enable_stp;
        delete newConfigs.network_wavesys[interfaceName].enable_auto;
        delete newConfigs.network_wavesys[interfaceName].enable_defaultroute;
        delete newConfigs.network_wavesys[interfaceName].enable_peerdns;

        if (newConfigs.dhcp_wavesys != undefined && interfaceData.dhcp != undefined) {
            if (interfaceData.dhcp.enable_dhcp) {
                newConfigs.dhcp_wavesys[interfaceName] = interfaceData.dhcp;
                newConfigs.dhcp_wavesys[interfaceName].interface = interfaceName;
                newConfigs.dhcp_wavesys[interfaceName]['.name'] = interfaceName;

                if (!newConfigs.dhcp_wavesys[interfaceName].enable_dhcp) {
                    newConfigs.dhcp_wavesys[interfaceName].ignore = '1';
                }
                if (!newConfigs.dhcp_wavesys[interfaceName].enable_dynamicdhcp) {
                    newConfigs.dhcp_wavesys[interfaceName].dynamicdhcp = '0';
                }
                if (newConfigs.dhcp_wavesys[interfaceName].enable_force) {
                    newConfigs.dhcp_wavesys[interfaceName].force = '1';
                }

                //Remove do elemento as variáveis não referentes a configurações Wavesys
                delete newConfigs.dhcp_wavesys[interfaceName].enable_dhcp;
                delete newConfigs.dhcp_wavesys[interfaceName].enable_dynamicdhcp;
                delete newConfigs.dhcp_wavesys[interfaceName].enable_force;
            }
        }
    }



    return newConfigs;
};

WavesysController.prototype.parseRadioConfigs = function (interfaceIfname, allConfigs) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'parseRadioConfigs', 'inicio');
    var radioConfigs = {};
    radioConfigs.radio = {};
    radioConfigs.radio.device = {};
    radioConfigs.radio.iface = {};
    radioConfigs.network = {};
    radioConfigs.dhcp = {};

    var interfaceName = "";

    if (allConfigs.wireless_wavesys != undefined) {
        for (var element in allConfigs.wireless_wavesys) {
            if (element == interfaceIfname) {
                radioConfigs.radio.device = allConfigs.wireless_wavesys[element];
            } else if (allConfigs.wireless_wavesys[element].device != undefined && allConfigs.wireless_wavesys[element].device == interfaceIfname) {
                radioConfigs.radio.iface = allConfigs.wireless_wavesys[element];
                if (radioConfigs.radio.iface.ht_mcs != undefined) {
                    var list = radioConfigs.radio.iface.ht_mcs.split(' ');
                    radioConfigs.radio.iface.ht_mcs_list = {};
                    for (var i = 0; i < list.length; i++) {
                        radioConfigs.radio.iface.ht_mcs_list[list[i]] = true;
                    }
                    delete radioConfigs.radio.iface.ht_mcs;
                }
                if (radioConfigs.radio.iface.hidden != undefined && radioConfigs.radio.iface.hidden == '1') {
                    radioConfigs.radio.iface.enable_hidden = true;
                }
                if (radioConfigs.radio.iface.wmm != undefined && radioConfigs.radio.iface.wmm == '0') {
                    radioConfigs.radio.iface.enable_wmm = false;
                } else {
                    radioConfigs.radio.iface.enable_wmm = true;
                }
                interfaceName = allConfigs.wireless_wavesys[element].network;
            }
        }
    }


    if (allConfigs.network_wavesys != undefined) {
        for (var element in allConfigs.network_wavesys) {
            if (element == interfaceName) {
                radioConfigs.network = allConfigs.network_wavesys[element];

                if (radioConfigs.network.type != undefined && radioConfigs.network.type == 'bridge') {
                    var arrSplit = [];
                    if (typeof allConfigs.network_wavesys[element].ifname == 'object') {
                        arrSplit = allConfigs.network_wavesys[element].ifname;
                    } else {
                        arrSplit = allConfigs.network_wavesys[element].ifname.split(" ");
                    }
                    radioConfigs.network.enable_bridge = true;
                    radioConfigs.network.bridgename = element;
                    radioConfigs.network.bridge = {};

                    for (var i = 0; i < arrSplit.length; i++) {
                        radioConfigs.network.bridge[arrSplit[i]] = true;
                    }

                    if (allConfigs.wireless_wavesys != undefined) {
                        for (var radioElement in allConfigs.wireless_wavesys) {
                            if (allConfigs.wireless_wavesys[radioElement].network != undefined && allConfigs.wireless_wavesys[radioElement].network == element) {
                                radioConfigs.network.bridge[allConfigs.wireless_wavesys[radioElement].device] = true;
                            }
                        }
                    }
                }
                break;

            }
        }
    }

    if (allConfigs.dhcp_wavesys != undefined) {
        for (var element in allConfigs.dhcp_wavesys) {
            if (allConfigs.dhcp_wavesys[element].interface != undefined && allConfigs.dhcp_wavesys[element].interface == interfaceName) {
                radioConfigs.dhcp = allConfigs.dhcp_wavesys[element];
                if (radioConfigs.dhcp.ignore == undefined || radioConfigs.dhcp.ignore != '1') {
                    radioConfigs.dhcp.enable_dhcp = true;
                }
                break;
            }
        }
    }

    return radioConfigs;
};


WavesysController.prototype.serializeRadioConfigs = function (allConfigs, interfaceData) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'serializeRadioConfigs', 'inicio');
    var newConfigs = JSON.parse(JSON.stringify(allConfigs));
    var radioInterfaceName = 'wlan' + interfaceData.ifname.substr(5, 1);
    var meshInterfaceName = 'meshradio' + interfaceData.ifname.substr(5, 1);

    if (newConfigs.radio_wavesys != undefined && interfaceData.radio != undefined) {
        //Colocar configurações do rádio nas configurações wireless
        newConfigs.radio_wavesys[interfaceData.radio.device[".name"]] = interfaceData.radio.device;
        newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]] = interfaceData.radio.iface;

        if (newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].enable_hidden) {
            newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].hidden = '1';
        } else {
            delete newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].hidden
        }
        if (!newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].enable_wmm) {
            newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].wmm = '0';
        } else {
            delete newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].wmm;
        }

        if (interfaceData.radio.iface.ht_mcs_list != undefined) {
            var ht_mcs = "";
            for (var mcsElement in interfaceData.radio.iface.ht_mcs_list) {
                if (interfaceData.radio.iface.ht_mcs_list[mcsElement]) {
                    ht_mcs = ht_mcs + mcsElement + " ";
                }
            }
            if (ht_mcs.trim() != '') {
                newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].ht_mcs = ht_mcs.trim();
            } else {
                delete newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].ht_mcs;
            }
            delete newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].ht_mcs_list;
        }

        delete newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].enable_hidden;
        delete newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].enable_wmm;

        if (newConfigs.network_wavesys != undefined && interfaceData.network != undefined) {
            //Apaga possíveis configurações existentes para o rádio
            delete newConfigs.network_wavesys[radioInterfaceName];
            delete newConfigs.network_wavesys[meshInterfaceName];

            if (newConfigs.dhcp_wavesys != undefined) {
                delete newConfigs.dhcp_wavesys[radioInterfaceName];
            }
            //Testa se a interface não está no modo adhoc
            if (interfaceData.radio.iface.mode == 'adhoc') {
                //Cria a interface para mesh
                newConfigs.network_wavesys[meshInterfaceName] = {};
                newConfigs.network_wavesys[meshInterfaceName].proto = 'batadv';
                newConfigs.network_wavesys[meshInterfaceName].mesh = 'bat0';
                if (interfaceData.network.mtu == undefined || interfaceData.network.mtu == '') {
                    newConfigs.network_wavesys[meshInterfaceName].mtu = '1532';
                } else {
                    newConfigs.network_wavesys[meshInterfaceName].mtu = interfaceData.network.mtu;
                }

                delete interfaceData.network.bridge[interfaceData.ifname];
                interfaceData.network.bridge['bat0'] = true;

                newConfigs = Controllers.Wavesys.serializeEthConfigs(newConfigs, interfaceData);
                newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].network = meshInterfaceName;

            } else {
                newConfigs = Controllers.Wavesys.serializeEthConfigs(newConfigs, interfaceData);
                if (interfaceData.network.type == undefined || interfaceData.network.type != 'bridge') {
                    newConfigs.radio_wavesys[interfaceData.radio.iface[".name"]].network = radioInterfaceName;
                }
            }
        }
    }
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'serializeRadioConfigs', newConfigs);
    return newConfigs;
};

module.exports = new WavesysController();