// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import * as url from 'url';

const DEFAULT_REGISTRY_ALIAS = 'docker.io';
/**
 * @fileoverview translate docker registry image specifiers like ubuntu:lts to
 * ImageLocation metadata objects
 */

export const parse = (specifier: string): ImageLocation => {
  const parts = specifier.split('/');

  // the image name
  let image = parts.pop() || '';

  let namespace = parts.pop();

  let registry = parts[0];

  // mydockerregistry.com:5000/ubuntu
  if (!registry && namespace) {
    if (namespace.indexOf(':') > -1) {
      if (!url.parse('a://' + namespace).port) {
        throw new Error(
            'if namespace has a : it should be th registry url and what follows the : must be the port number ' +
            specifier);
      }
    }
    registry = namespace;
    namespace = undefined;
  }

  if (!registry || registry === DEFAULT_REGISTRY_ALIAS) {
    registry = 'index.docker.io';
  }

  if (registry.indexOf('docker.io') > -1 && !namespace) {
    namespace = 'library';
  }


  const imageProps: {[k: string]: string} = {};

  ['@', ':'].forEach((c) => {
    if (image.indexOf(c) > -1) {
      const imageParts = image.split(c);
      imageProps[c] = imageParts.pop() || '';
      // ignores multiple @s and tags :shrug:
      image = imageParts.join(c);
    }
  });

  const digest = imageProps['@'];
  const tag = imageProps[':'] || 'latest';


  const protocol = boldlyAssumeProtocol(registry);

  return {protocol, registry, namespace, image, tag, digest};
};

function boldlyAssumeProtocol(registry: string) {
  // from
  // https://github.com/google/go-containerregistry/blob/efb7e1b888e142e2c66af20fd44e76a939b2cc3e/pkg/name/registry.go#L28
  // match a.local:0000
  if (/.*\.local(?:host)?(?::\d{1,5})?$/.test(registry)) return 'http';
  // Detect the loopback IP (127.0.0.1)
  if (registry.indexOf('localhost:') > -1) return 'http';
  if (registry.indexOf('127.0.0.1') > -1) return 'http';
  if (registry.indexOf('::1') > -1) return 'http';

  return 'https';
}

/// these ImageLocation objects for the base of how all
export interface ImageLocation {
  protocol: string;
  registry: string;
  namespace?: string;
  image: string;
  tag?: string;
  digest?: string;
}