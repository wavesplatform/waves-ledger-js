#!/bin/bash
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2581\", ATTRS{idProduct}==\"1b7c\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2581\", ATTRS{idProduct}==\"2b7c\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2581\", ATTRS{idProduct}==\"3b7c\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2581\", ATTRS{idProduct}==\"4b7c\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2581\", ATTRS{idProduct}==\"1807\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2581\", ATTRS{idProduct}==\"1808\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2c97\", ATTRS{idProduct}==\"0000\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"2c97\", ATTRS{idProduct}==\"0001\", MODE=\"0660\", GROUP=\"plugdev\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules

echo "KERNEL=="hidraw*", SUBSYSTEM==\"hidraw\", MODE=\"0660\", GROUP=\"plugdev\", ATTRS{idVendor}==\"2c97\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules
echo "KERNEL=="hidraw*", SUBSYSTEM==\"hidraw\", MODE=\"0660\", GROUP=\"plugdev\", ATTRS{idVendor}==\"2581\" OWNER=\"$USER\"" >>/etc/udev/rules.d/20-hw1.rules

udevadm trigger
udevadm control --reload-rules
sudo usermod -a -G plugdev $USER
