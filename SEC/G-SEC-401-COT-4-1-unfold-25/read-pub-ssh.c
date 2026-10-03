ECORP Internal Development Manual
Project Codename: ECorp
Version: 0.9.3-alpha
Audience: Internal Developers & Security Reviewers
Classification: Internal Use Only

Overview

The ECorp project is an internal development program used to train and validate secure coding practices within ECORP-managed environments.

The objective of this training module is to provide developers with a minimal application demonstrating common implementation patterns used in internal tooling. These examples are intended to illustrate how user input is processed by legacy components and how developers should reason about control flow and program behavior.

Its goals include:
* Understanding how input is handled in low-level applications
* Reviewing typical control-flow structures used in internal utilities
* Familiarizing developers with ECORP-style command interfaces
* Encouraging secure review practices for legacy-compatible code

This document provides contextual information for developers interacting with the example program and its internal routines.

Environment variables:
TOKEN = "EPI{1_H0P3_Y0uLL_g1v3_m3_4_C4Ll84ck}"
USER  = "junior-dev"
PASS  = "1337_PAzZW0rd"

Source code:

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

char *gets(char *s);

void read_ssh() {
  printf("Congrats, here is your public key:\n");
  system("cat /home/junior-dev/.ssh/id_rsa.pub");
  exit(EXIT_SUCCESS);
}

void finish() {
  char buffer[137];

  printf("E-Corp $> ");
  fflush(stdout);
  gets(buffer);
  printf("  => buffer  : \"%s\"\n", buffer);
}

int main(int argc, char **argv) {
  printf("ECorp basic binary training program\n\n");
  printf("Find the weakness in this program to call unwanted function\n\n");
  finish();
  printf("Too bad, if you're reading this, you didn't manage to read the pubkey...\n");
  return 0;
}

// gcc read-pub-ssh.c -fno-stack-protector -fno-pie -no-pie

TODO: fix the bot, its answers are erratic and sometimes it even leak its own source code!
I locked it up for now with the secret token
