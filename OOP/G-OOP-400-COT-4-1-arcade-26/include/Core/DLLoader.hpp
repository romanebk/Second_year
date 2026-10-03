
#ifndef DLLOADER_HPP
#define DLLOADER_HPP

#include <stdio.h>
#include <dlfcn.h>
#include <iostream>
#include <exception>
#include "../Error.hpp"
#include "../ILibrary/IDisplay.hpp"
#include "../ILibrary/IGame.hpp"

template <typename T>
class DLLoader {
    public:
        DLLoader(std::string const &path) {
            handle = dlopen(path.c_str(), RTLD_LAZY);
            if (!handle) {
                throw Error(dlerror());
            }
        }
        ~DLLoader() {
            if (handle) {
                dlclose(handle);
            }
        }
        T *getInstance(std::string const &name) {
            T *(*myEntryPoint)(void);
            myEntryPoint = reinterpret_cast<T *(*)(void)>(dlsym(handle, name.c_str()));
            char *error = dlerror();
            if (error != nullptr) throw Error(error);
            return myEntryPoint();
        }
        
        void destroyInstance(T *instance, const std::string &symbolName) {
            void (*external_destructor)(T *);
            external_destructor = reinterpret_cast<void (*)(T *)>(dlsym(handle, symbolName.c_str()));        
            if (external_destructor) {
                external_destructor(instance);
            } else {
                throw Error("Can't delete the object");
            }
        }

    private:
        void *handle;
};

#endif