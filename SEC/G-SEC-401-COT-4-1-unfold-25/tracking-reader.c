#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

char *gets(char *s);

int main(int argc, char **argv) {
  char buffer[371];

  printf("ECorp user tracking log reader [MANAGEMENT ONLY]\n\n");

  setregid(4, 4);
  printf("Enter management password $> ");
  gets(buffer);
  if (strcmp(buffer, "<REDACTED>"))
    system("cat /var/log/tracking.log");
  return 0;
}

// gcc tracking-reader.c -fno-stack-protector -z execstack# gcc
// tracking-reader.c -fno-stack-protector -z execstack